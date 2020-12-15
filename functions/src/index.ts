import * as functions from "firebase-functions";
import * as sgMail from "@sendgrid/mail";
import * as admin from "firebase-admin";
const { firestore } = admin;

admin.initializeApp();

const MAIL_API_KEY = functions.config().sendgrid.key;
const SENDGRID_EMAIL = functions.config().sendgrid.mail;
//Welcome templates
const MAIL_WELCOME_ADMIN_TEMPLATE_ID = functions.config().sendgrid.template.welcome;
const MAIL_WELCOME_PROVIDER_TEMPLATE_ID = functions.config().sendgrid.template.welcome.provider;
const MAIL_WELCOME_USER_TEMPLATE_ID = functions.config().sendgrid.template.welcome.user;
const MAIL_MESSAGE_TEMPLATE_ID = functions.config().sendgrid.template.message;

// receipt templates
const MAIL_RECEIPT_TEMPLATE_ID = functions.config().sendgrid.template.receipt;

sgMail.setApiKey(MAIL_API_KEY);

export const sendEmail = functions.https.onRequest(async (request, response) => {
  const msg = {
    to: "matematicoelismar@gmail.com",
    from: "2017-0077@unad.edu.do",
    subject: "Sending with Twilio SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  };
  const emailRes = await sgMail.send(msg);
  response.json(emailRes);
});

export const affiliateEmailToUser = functions.https.onCall(async (data, context) => {
  // verificar que no exista ningun usuario con este usuario.
  //si no,  actualizar el record del usuario con el email proveido.
  const { uid, email } = data;
  const users = await admin.firestore().collection("users").where("email", "==", email).get();

  if (users.docs.length > 0) {
    return {
      errorInfo: { message: "Ya existe un usuario registrado con este email." },
    };
  } else {
    const x = await admin
      .firestore()
      .doc("users/" + uid)
      .update({ email });

    // Enviar un correo indicando que se ha vinculado su cuenta.
    sgMail
      .send({
        from: "matematicoelismar@gmail.com",
        to: email,
        subject: "Afiliacion de cuenta.",
        text: "Hemos afiliado este correo con su cuenta de facebook en Events App",
      })
      .then((r) => console.log(r))
      .catch((err) => console.error(err));

    return x;
  }
});

export const createUser = functions.https.onCall(async (data, context) => {
  const userRecord = admin
    .auth()
    .createUser(data)
    .catch(function (error) {
      console.error("Error creating new user:", error);
      return { error };
    });
  return { data: userRecord };
});

export const disableUser = functions.https.onCall(async (data, context) => {
  const userRecord = admin
    .auth()
    .updateUser(data.uid, { disabled: true })
    .catch(function (error) {
      console.error("Error disabling user:", error);
      return error;
    });
  return userRecord;
});

export const enableUser = functions.https.onCall(async (data, context) => {
  const userRecord = admin
    .auth()
    .updateUser(data.uid, { disabled: false })
    .catch(function (error) {
      console.error("Error enabling user:", error);
      return error;
    });
  return userRecord;
});

// Modeled after base64 web-safe chars, but ordered by ASCII.
const PUSH_CHARS = "-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz";

// Timestamp of last push, used to prevent local collisions if you push twice in one ms.
var lastPushTime = 0;

// We generate 72-bits of randomness which get turned into 12 characters and appended to the
// timestamp to prevent collisions with other clients.  We store the last characters we
// generated because in the event of a collision, we'll use those same characters except
// "incremented" by one.
var lastRandChars: any[] = [];

function generatePushID() {
  var now = new Date().getTime();
  var duplicateTime = now === lastPushTime;
  lastPushTime = now;

  var timeStampChars = new Array(8);
  for (var i = 7; i >= 0; i--) {
    timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
    // NOTE: Can't use << here because javascript will convert to int and lose the upper bits.
    now = Math.floor(now / 64);
  }

  if (now !== 0) throw new Error("We should have converted the entire timestamp.");

  var id = timeStampChars.join("");

  if (!duplicateTime) {
    for (i = 0; i < 12; i++) {
      lastRandChars[i] = Math.floor(Math.random() * 64);
    }
  } else {
    // If the timestamp hasn't changed since last push, use the same random number, except incremented by 1.
    for (i = 11; i >= 0 && lastRandChars[i] === 63; i--) {
      lastRandChars[i] = 0;
    }
    lastRandChars[i]++;
  }
  for (i = 0; i < 12; i++) {
    id += PUSH_CHARS.charAt(lastRandChars[i]);
  }
  if (id.length != 20) throw new Error("Length should be 20.");

  return id;
}

export const sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
  // get the user role
  const userDoc = await admin
    .firestore()
    .doc("/users/" + user.uid)
    .get();

  const userRole = userDoc.get("role");
  const templateID =
    userRole == "admin"
      ? MAIL_WELCOME_ADMIN_TEMPLATE_ID
      : userRole == "provider"
      ? MAIL_WELCOME_PROVIDER_TEMPLATE_ID
      : MAIL_WELCOME_USER_TEMPLATE_ID;

  const msg = {
    to: user.email,
    from: SENDGRID_EMAIL,
    templateId: templateID,
    dynamic_template_data: {
      displayName: user.displayName,
      email: user.email,
    },
  };
  return sgMail.send(msg);
});

export const sendMessageEmail = functions.firestore.document("conversations/{id}").onUpdate(async (change, context) => {
  // Si es un mensaje directo se busca el destinatary userID
  // Si es un mensaje de evento, se buscan todos los usuarios que tienes conecciones con este evento y se les envia el correo.
  const conversationID = context.params.id;
  // get the user role
  const users = await admin.firestore().collection("users").get();
  const emails = new Array<string>();
  users.docs.map((u) => {
    const connections: Array<any> = u.get("connections");
    if (connections && connections.find((c) => c.conversationID == conversationID)) {
      emails.push(u.get("email"));
    }
  });

  console.log(emails);

  const messages: any[] = change.after.get("messages");
  const message = messages.pop();
  const messageOwner = await message.userRef.get();
  const index = emails.findIndex((x) => x == messageOwner.get("email"));
  emails.splice(index, 1);
  console.info(emails, message);

  const msg = {
    to: emails,
    from: SENDGRID_EMAIL,
    templateId: MAIL_MESSAGE_TEMPLATE_ID,
    dynamic_template_data: {
      messageOwnerName: messageOwner.get("displayName"),
      message,
    },
  };
  return sgMail.send(msg);
});

export const OnPayEvent = functions.firestore.document("events/{id}").onUpdate(async (change, context) => {
  // si se pago el evento
  // se envia el recibo y se le envia un mensaje de la administracion al usuario.
  console.log(change.before.get("status"), change.after.get("status"));
  if (change.before.get("status") == "quotation" && change.after.get("status") == "paid") {
    //#region sendReceipt
    const data = change.after.data();
    console.log("event data", data);

    // Get User Email
    const userDoc = await admin
      .firestore()
      .doc("/users/" + data!.uid)
      .get();

    const event: {
      name: string;
      userEmail: string;
      date: string;
      products: {
        cantidad: number;
        price: string;
        name: string;
        categorie: string;
      }[];
    } = {
      name: data!.name,
      userEmail: userDoc.get("email"),
      date: data!.date,
      products: data!.products.map((p: any) => {
        return {
          cantidad: p.cantidad,
          price: p.service.price,
          name: p.service.name,
          categorie: p.service.categorie.name,
        };
      }),
    };

    const msg = {
      to: userDoc.get("email"),
      from: SENDGRID_EMAIL,
      subject: "Order Details",
      templateId: MAIL_RECEIPT_TEMPLATE_ID,
      dynamic_template_data: {
        event,
      },
    };
    await sgMail.send(msg);
    //#endregion

    //#region SendFirstMessage From Administration
    // Create the Conversation.
    const users = await admin.firestore().collection("users").get();
    const eventRef = (
      await admin
        .firestore()
        .doc("/events/" + context.params.id)
        .get()
    ).ref;
    const convs = await admin.firestore().collection("conversations").where("eventRef", "==", eventRef).get();
    console.log(convs);
    const conversationID = generatePushID();
    await admin
      .firestore()
      .doc("conversations/" + conversationID)
      .set({
        eventRef,
        id: conversationID,
        scope: "event",
        messages: [
          {
            userRef: users.docs[0].ref,
            timestamp: firestore.Timestamp.now(),
            subject: "Hemos aceptado tu peticion.",
            message: "Gracias por preferirnos",
          },
        ],
      });

    const connection = {
      scope: "event",
      conversationID,
      eventRef,
    };

    const batch = admin.firestore().batch();

    // Se le agrega la conexion al due?o del evento y a los administradores
    users.docs.map((u) => {
      if (u.get("role") == "admin" || u.get("uid") == data!.uid) {
        const connections = firestore.FieldValue.arrayUnion(connection);
        batch.update(u.ref, {
          connections: connections,
        });
      }
    });

    batch
      .commit()
      .then((r) => {
        console.log("Se agregaron todos los administradores a la conversacion de este evento", r);
      })
      .catch((err) => console.log(err));
  }
});
