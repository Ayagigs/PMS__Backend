export const notificationsMessage = async () => {
  const message = `

    <div
        style="
          width: 658px;
          border-radius: 0px;
          padding: 48px;
          background: #f1f3f4;
        "
      >
        <h2>Hey ${employee.firstName},</h2>
        <p>
        ${req.userAuth.companyName} has invited you to join the team as ${employee.role}. Accept the invitation to start creating awesome things
          together.
        </p>
        <p>This invite only lasts for 7 days.</p>

        <p
          style="
            padding: 19px 32px;
            text-decoration: none;
            color: white;

            width: 211px;
            background: rgba(62, 69, 235, 1);
          "
        >
          <a
            href="${invitationLink}"
            clicktracking="off"
            style="
              font-family: 'Satoshi';
              font-style: normal;
              font-weight: 700;
              font-size: 16px;
              line-height: 140%;
              display: flex;
              align-items: center;
              text-align: center;
              color: #ffffff;
              text-decoration: none;
              justify-content: center;
            "
            >Accept Invitation</a
          >
        </p>

        <p><Regards.../P></p>
        <p>Aya Team4</p>
      </div>
    `;

  const subject = "Task Deadline";
  const send_to = employee.workEmail;
  const sent_from = process.env.EMAIL_USER;

  try {
    await emailSender(subject, message, send_to, sent_from);
    const token = employee.generateToken();
  } catch (error) {
    res.status(500).send({ status: "Fail", message: error.message });
  }
};
