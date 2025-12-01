import { EmailMessageKey, SupportedLanguage } from "../types";

// English templates
const dearVol = "Dear Volunteer,<br><br>";
const dearAdmin = "Dear Admins,<br><br>";
const closing = "Best regards,<br>Overbeck Museum";
const wish = "<br>Have a great day!";

// German templates
const dearVolDe = "Liebe/r Freiwillige/r,<br><br>";
const dearAdminDe = "Liebe Admins,<br><br>";
const closingDe = "Mit freundlichen Grüßen,<br>Overbeck Museum";
const wishDe = "<br>Einen schönen Tag noch!";

type EmailMessages = {
  [K in SupportedLanguage]: {
    [M in EmailMessageKey]: string;
  };
};

const emailMessages: EmailMessages = {
  en: {
    "New TimeSlot": `${dearAdmin}This is to notify you about a new timeslot application submitted by <strong>{name}</strong>.<br>
Please review the details and take appropriate action.<br><br>
Thank you.${wish}`,

        "New Assignment": `${dearVol}You have been assigned a new volunteering shift.<br><br>
<strong>Date:</strong> {date}<br><br>
If you have any questions or need to make changes, please contact an administrator.<br><br>
${closing}`,

    "New Volunteer": `${dearAdmin}Excited to inform you about a new volunteer registration.<br><br>
Name: <strong>{name}</strong><br><br>
Please extend a warm welcome to our new volunteer.<br><br>
Thank you.${wish}`,

    "TimeSlot Approved": `${dearVol}We're pleased to inform you that your timeslot application has been approved.<br>
Thank you for your interest in volunteering with us!<br><br>${closing}`,

    "TimeSlot Rejected": `${dearVol}We regret to inform you that your timeslot application has been rejected.<br>
Reason for rejection: <strong>{reason}</strong><br><br>We appreciate your interest in volunteering with us and encourage you to apply for other timeslots.<br><br>
If you have any questions or need further assistance, please don't hesitate to contact us.<br><br>
Thank you for your understanding.<br><br>${closing}`,

    "Account Approved": `${dearVol}We are delighted to inform you that your account has been approved!<br>\
You can now access all features and opportunities available for volunteers.<br>\
If you have any questions or need assistance, feel free to reach out to us.<br>\
<br>\
Thank you for joining us in making a positive impact!<br>\
<br>${closing}`,

    "Account Rejected": `${dearVol}We regret to inform you that your account registration has been rejected.<br>\
Unfortunately, your application does not meet our current requirements.<br>\
If you believe this decision is in error or have any questions, please don't hesitate to contact us.<br>\
<br>\
Thank you for your interest in volunteering with us. We appreciate your understanding.<br>\
<br>${closing}`,

    "New Admin": `Dear {name}<br><br>Welcome to the team!<br><br>
We're thrilled to announce that you've been added as an administrator for Overbeck Museum Volunteers Management App.<br><br>
Your contribution will play a vital role in managing and enhancing our volunteering program.<br><br>
Please familiarize yourself with your new responsibilities, and don't hesitate to reach out if you have any questions or need assistance.<br><br>
Thank you for joining us on this journey!<br>
${closing}`,

    "Cancellation Request": `${dearAdmin}A volunteer has requested to cancel their scheduled shift.<br><br>
<strong>Volunteer:</strong> {name}<br>
<strong>Date:</strong> {date}<br>
<strong>Time:</strong> {time}<br><br>
<strong>Reason:</strong><br>{reason}<br><br>
Please review this request and take appropriate action.<br><br>
Thank you.${wish}`,

    "Cancellation Approved": `${dearVol}Your cancellation request has been approved.<br><br>
<strong>Date:</strong> {date}<br>
<strong>Time:</strong> {time}<br><br>
You have been removed from this shift. If you'd like to volunteer for another time, please submit a new application.<br><br>
${closing}`,

    "Cancellation Rejected": `${dearVol}Your cancellation request has been reviewed but could not be approved at this time.<br><br>
<strong>Date:</strong> {date}<br>
<strong>Time:</strong> {time}<br><br>
You are still scheduled for this shift. If you have any questions or concerns, please contact an administrator.<br><br>
${closing}`,
  },

  de: {
    "New TimeSlot": `${dearAdminDe}Hiermit informieren wir Sie über eine neue Schichtbewerbung von <strong>{name}</strong>.<br>
Bitte prüfen Sie die Details und ergreifen Sie entsprechende Maßnahmen.<br><br>
Vielen Dank.${wishDe}`,

        "New Assignment": `${dearVolDe}Sie wurden einer neuen Freiwilligenschicht zugewiesen.<br><br>
<strong>Datum:</strong> {date}<br><br>
Wenn Sie Fragen haben oder Änderungen vornehmen müssen, wenden Sie sich bitte an einen Administrator.<br><br>
${closingDe}`,

    "New Volunteer": `${dearAdminDe}Wir freuen uns, Ihnen eine neue Freiwilligenregistrierung mitzuteilen.<br><br>
Name: <strong>{name}</strong><br><br>
Bitte heißen Sie unseren neuen Freiwilligen herzlich willkommen.<br><br>
Vielen Dank.${wishDe}`,

    "TimeSlot Approved": `${dearVolDe}Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Schichtbewerbung genehmigt wurde.<br>
Vielen Dank für Ihr Interesse an der Freiwilligenarbeit bei uns!<br><br>${closingDe}`,

    "TimeSlot Rejected": `${dearVolDe}Wir bedauern, Ihnen mitteilen zu müssen, dass Ihre Schichtbewerbung abgelehnt wurde.<br>
Grund für die Ablehnung: <strong>{reason}</strong><br><br>Wir schätzen Ihr Interesse an der Freiwilligenarbeit bei uns und ermutigen Sie, sich für andere Schichten zu bewerben.<br><br>
Bei Fragen oder wenn Sie weitere Unterstützung benötigen, zögern Sie bitte nicht, uns zu kontaktieren.<br><br>
Vielen Dank für Ihr Verständnis.<br><br>${closingDe}`,

    "Account Approved": `${dearVolDe}Wir freuen uns, Ihnen mitteilen zu können, dass Ihr Konto genehmigt wurde!<br>\
Sie können nun auf alle Funktionen und Möglichkeiten für Freiwillige zugreifen.<br>\
Bei Fragen oder wenn Sie Unterstützung benötigen, können Sie sich gerne an uns wenden.<br>\
<br>\
Vielen Dank, dass Sie sich uns anschließen, um einen positiven Beitrag zu leisten!<br>\
<br>${closingDe}`,

    "Account Rejected": `${dearVolDe}Wir bedauern, Ihnen mitteilen zu müssen, dass Ihre Kontoregistrierung abgelehnt wurde.<br>\
Leider erfüllt Ihre Bewerbung nicht unsere aktuellen Anforderungen.<br>\
Wenn Sie glauben, dass diese Entscheidung ein Fehler ist, oder Fragen haben, zögern Sie bitte nicht, uns zu kontaktieren.<br>\
<br>\
Vielen Dank für Ihr Interesse an der Freiwilligenarbeit bei uns. Wir schätzen Ihr Verständnis.<br>\
<br>${closingDe}`,

    "New Admin": `Liebe/r {name}<br><br>Willkommen im Team!<br><br>
Wir freuen uns, Ihnen mitteilen zu können, dass Sie als Administrator für die Overbeck Museum Freiwilligen-Management-App hinzugefügt wurden.<br><br>
Ihr Beitrag wird eine wichtige Rolle bei der Verwaltung und Verbesserung unseres Freiwilligenprogramms spielen.<br><br>
Bitte machen Sie sich mit Ihren neuen Aufgaben vertraut und zögern Sie nicht, sich bei Fragen oder wenn Sie Unterstützung benötigen, an uns zu wenden.<br><br>
Vielen Dank, dass Sie uns auf dieser Reise begleiten!<br>
${closingDe}`,

    "Cancellation Request": `${dearAdminDe}Ein Freiwilliger hat die Stornierung seiner geplanten Schicht beantragt.<br><br>
<strong>Freiwillige/r:</strong> {name}<br>
<strong>Datum:</strong> {date}<br>
<strong>Zeit:</strong> {time}<br><br>
<strong>Grund:</strong><br>{reason}<br><br>
Bitte prüfen Sie diese Anfrage und ergreifen Sie entsprechende Maßnahmen.<br><br>
Vielen Dank.${wishDe}`,

    "Cancellation Approved": `${dearVolDe}Ihre Stornierungsanfrage wurde genehmigt.<br><br>
<strong>Datum:</strong> {date}<br>
<strong>Zeit:</strong> {time}<br><br>
Sie wurden von dieser Schicht entfernt. Wenn Sie sich für eine andere Zeit freiwillig melden möchten, reichen Sie bitte eine neue Bewerbung ein.<br><br>
${closingDe}`,

    "Cancellation Rejected": `${dearVolDe}Ihre Stornierungsanfrage wurde geprüft, konnte aber derzeit nicht genehmigt werden.<br><br>
<strong>Datum:</strong> {date}<br>
<strong>Zeit:</strong> {time}<br><br>
Sie sind weiterhin für diese Schicht eingeplant. Bei Fragen oder Bedenken wenden Sie sich bitte an einen Administrator.<br><br>
${closingDe}`,
  },
};

export const getMessage = (
  key: string,
  lang: SupportedLanguage = "en",
): string => {
  const messages = emailMessages[lang] || emailMessages.en;
  return (
    messages[key as EmailMessageKey] ||
    emailMessages.en[key as EmailMessageKey] ||
    ""
  );
};
