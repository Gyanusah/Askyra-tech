import { createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { Enrollment, Payment, ServiceRequest } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncRoute } from "../middleware/asyncRoute.js";

const checkoutSchema = z.object({
  paymentMethod: z.enum(["khalti", "esewa", "bank_transfer"]),
});

function invoiceNumber() {
  return `ASK-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function makeSignature(secret, message) {
  return createHmac("sha256", secret).update(message).digest("base64");
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function redirectToDashboard(config, outcome, role = "student") {
  return `${config.clientOrigin}/dashboard/${role}?payment=${encodeURIComponent(outcome)}`;
}

async function completePayment(payment, providerRef) {
  if (payment.status !== "paid") {
    await Payment.updateOne(
      { _id: payment._id, status: "pending" },
      { $set: { status: "paid", paidAt: new Date(), providerRef } },
    );
  }
  if (payment.enrollment) {
    await Enrollment.updateOne(
      { _id: payment.enrollment },
      { $set: { status: "active" } },
    );
  }
  if (payment.serviceRequest) {
    await ServiceRequest.updateOne(
      { _id: payment.serviceRequest, status: "submitted" },
      { $set: { status: "reviewing" } },
    );
  }
}

function ensureTestMode(config) {
  if (config.paymentMode !== "test") {
    const error = new Error("Live payment processing is disabled until production credentials and review are configured.");
    error.status = 503;
    throw error;
  }
}

export function createPaymentsRouter(express, config) {
  const router = express.Router();

  router.get("/methods", (_req, res) => {
    const testModeEnabled = config.paymentMode === "test";
    return res.json({
      methods: [
        {
          value: "khalti",
          label: "Khalti",
          enabled: testModeEnabled && Boolean(config.khaltiSecretKey),
        },
        {
          value: "esewa",
          label: "eSewa",
          enabled: testModeEnabled && Boolean(config.esewaSecretKey && config.esewaMerchantCode),
        },
        { value: "bank_transfer", label: "Bank transfer", enabled: true },
      ],
    });
  });

  router.post("/:paymentId/checkout", requireAuth(config), asyncRoute(async (req, res) => {
    const input = checkoutSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: "Select Khalti, eSewa, or bank transfer." });

    const payment = await Payment.findById(req.params.paymentId);
    if (!payment || String(payment.user) !== req.user.id) {
      return res.status(404).json({ error: "Payment not found." });
    }
    if (!["pending", "failed"].includes(payment.status)) {
      return res.status(409).json({ error: "This payment is no longer pending." });
    }

    const paymentMethod = input.data.paymentMethod;
    if (payment.status === "failed") {
      payment.status = "pending";
      payment.providerRef = "";
      payment.paidAt = null;
    }
    payment.provider = paymentMethod;
    await payment.save();

    if (paymentMethod === "bank_transfer") {
      return res.json({
        payment: payment.toJSON(),
        bankTransfer: {
          status: "pending",
          instructions: "Contact AskYRA Tech for bank details. Your enrollment activates after an administrator verifies the transfer.",
          reference: payment.invoiceNumber,
        },
      });
    }

    ensureTestMode(config);
    if (paymentMethod === "khalti") {
      if (!config.khaltiSecretKey) return res.status(503).json({ error: "Khalti test credentials are not configured on the server." });
      const response = await fetch(`${config.khaltiBaseUrl}/epayment/initiate/`, {
        method: "POST",
        headers: {
          Authorization: `Key ${config.khaltiSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          return_url: `${config.apiPublicUrl}/api/payments/callback/khalti`,
          website_url: config.clientOrigin,
          amount: payment.amountNPR * 100,
          purchase_order_id: payment.id,
          purchase_order_name: payment.description,
          customer_info: {
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone || undefined,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.pidx || !result.payment_url) {
        console.error("Khalti initiate failed", { status: response.status, response: result });
        return res.status(502).json({ error: "Khalti could not start checkout. Try again later." });
      }
      payment.providerRef = result.pidx;
      await payment.save();
      return res.json({
        paymentId: payment.id,
        checkoutUrl: result.payment_url,
      });
    }

    if (!config.esewaSecretKey || !config.esewaMerchantCode) {
      return res.status(503).json({ error: "eSewa test credentials are not configured on the server." });
    }
    const amount = payment.amountNPR.toFixed(2);
    const transactionUuid = randomUUID();
    const signedFieldNames = "total_amount,transaction_uuid,product_code";
    const signature = makeSignature(
      config.esewaSecretKey,
      `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${config.esewaMerchantCode}`,
    );
    payment.providerRef = transactionUuid;
    await payment.save();
    return res.json({
      paymentId: payment.id,
      checkout: {
        provider: "esewa",
        url: config.esewaFormUrl,
        fields: {
          amount,
          tax_amount: "0",
          total_amount: amount,
          transaction_uuid: transactionUuid,
          product_code: config.esewaMerchantCode,
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: `${config.apiPublicUrl}/api/payments/callback/esewa/success`,
          failure_url: `${config.apiPublicUrl}/api/payments/callback/esewa/failure`,
          signed_field_names: signedFieldNames,
          signature,
        },
      },
    });
  }));

  router.get("/callback/khalti", asyncRoute(async (req, res) => {
    const pidx = typeof req.query.pidx === "string" ? req.query.pidx : "";
    if (!pidx || !config.khaltiSecretKey) return res.redirect(redirectToDashboard(config, "failed"));

    const payment = await Payment.findOne({ provider: "khalti", providerRef: pidx }).populate("user", "role");
    if (!payment) return res.redirect(redirectToDashboard(config, "failed"));

    const lookupResponse = await fetch(`${config.khaltiBaseUrl}/epayment/lookup/`, {
      method: "POST",
      headers: {
        Authorization: `Key ${config.khaltiSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pidx }),
    });
    const lookup = await lookupResponse.json();
    const matchesOrder =
      lookupResponse.ok &&
      lookup.status === "Completed" &&
      lookup.pidx === pidx &&
      Number(lookup.total_amount) === payment.amountNPR * 100 &&
      (!lookup.purchase_order_id || lookup.purchase_order_id === payment.id);

    if (!matchesOrder) {
      return res.redirect(redirectToDashboard(config, "failed", payment.user.role));
    }
    await completePayment(payment, pidx);
    return res.redirect(redirectToDashboard(config, "success", payment.user.role));
  }));

  router.get("/callback/esewa/success", asyncRoute(async (req, res) => {
    const encoded = typeof req.query.data === "string" ? req.query.data : "";
    if (!encoded || !config.esewaSecretKey) return res.redirect(redirectToDashboard(config, "failed"));

    let responseData;
    try {
      responseData = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
    } catch {
      return res.redirect(redirectToDashboard(config, "failed"));
    }

    const transactionId = responseData.transaction_uuid;
    const payment = transactionId
      ? await Payment.findOne({
          provider: "esewa",
          providerRef: transactionId,
        }).populate("user", "role")
      : null;
    const signedFields = typeof responseData.signed_field_names === "string"
      ? responseData.signed_field_names.split(",")
      : [];
    const requiredSignedFields = ["transaction_uuid", "status", "total_amount", "product_code"];
    if (
      !payment ||
      payment.provider !== "esewa" ||
      !requiredSignedFields.every((field) => signedFields.includes(field))
    ) {
      return res.redirect(redirectToDashboard(config, "failed", payment?.user?.role));
    }

    const signedMessage = signedFields
      .map((field) => `${field}=${responseData[field]}`)
      .join(",");
    const expectedSignature = makeSignature(config.esewaSecretKey, signedMessage);
    const signatureIsValid =
      typeof responseData.signature === "string" &&
      safeEqual(expectedSignature, responseData.signature);
    const responseMatches =
      signatureIsValid &&
      responseData.status === "COMPLETE" &&
      responseData.product_code === config.esewaMerchantCode &&
      Number(String(responseData.total_amount).replaceAll(",", "")) === payment.amountNPR;
    if (!responseMatches) return res.redirect(redirectToDashboard(config, "failed", payment.user.role));

    const query = new URLSearchParams({
      product_code: config.esewaMerchantCode,
      total_amount: payment.amountNPR.toFixed(2),
      transaction_uuid: payment.providerRef,
    });
    const statusResponse = await fetch(`${config.esewaStatusUrl}?${query}`);
    const statusData = await statusResponse.json();
    if (
      !statusResponse.ok ||
      statusData.status !== "COMPLETE" ||
      statusData.product_code !== config.esewaMerchantCode ||
      Number(String(statusData.total_amount).replaceAll(",", "")) !== payment.amountNPR ||
      statusData.transaction_uuid !== payment.providerRef
    ) {
      return res.redirect(redirectToDashboard(config, "failed", payment.user.role));
    }

    await completePayment(payment, responseData.transaction_code || transactionId);
    return res.redirect(redirectToDashboard(config, "success", payment.user.role));
  }));

  router.get("/callback/esewa/failure", asyncRoute(async (req, res) => {
    const transactionId = typeof req.query.transaction_uuid === "string"
      ? req.query.transaction_uuid
      : "";
    const payment = transactionId
      ? await Payment.findOne({
          provider: "esewa",
          providerRef: transactionId,
        }).populate("user", "role")
      : null;
    if (transactionId) {
      await Payment.updateOne(
        { provider: "esewa", providerRef: transactionId, status: "pending" },
        { $set: { status: "failed" } },
      );
    }
    return res.redirect(redirectToDashboard(config, "failed", payment?.user?.role));
  }));

  return router;
}

export { invoiceNumber };
