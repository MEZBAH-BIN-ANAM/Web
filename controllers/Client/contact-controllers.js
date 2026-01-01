const Contact = require("../../models/contactModel");

const addContact = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const contactData = await Contact.create({ name, phone, email, message });

    return res.status(201).json({
      success: true,
      message: "Message sent successful",
      contactData: contactData,
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { addContact };
