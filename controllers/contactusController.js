import { emailSender } from '../utils/emailSender.js';


export const contactUsMail = async(req, res) => {
    const {fullname, email, location, companyName } = req.body;
    const message = `
    <div
    style="
      width: 658px;
      border-radius: 0px;
      padding: 48px;
      background: rgb(250, 250, 250);
    "
  >
    <h2 style="
        paddingBottom: 30px;
    ">${fullname} is requesting a demo</h2>
    <p style="
        paddingBottom: 20px;
    ">Hi View</p>
    <pstyle="
        paddingBottom: 20px;
    ">
      <b>${fullname}</b> is requesting a demo with you on behalf of <b>${companyName}</b>. Their current location is ${location} and they can be contacted through ${email}
    </p>
    <p><Regards.../P></p>
    <p></p>
  </div>`

    const subject = "Request a Demo";
    const send_to = "sophieokosodo@gmail.com";
    const sent_from = email;

    try {
      await emailSender(subject, message, send_to, sent_from);
      res.status(200).json({
        success: true,
        message: `Demo Request Successfull`,
      });
    } catch (error) {
      res.status(500).send({ status: "Fail", message: error.message });
    }

}