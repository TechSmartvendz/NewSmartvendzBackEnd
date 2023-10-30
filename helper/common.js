const bcrypt = require("bcryptjs");

const saltSounds = 10;

exports.verifyJoiSchema = async (data, schema) => schema.validate(data);

exports.generateNewPassword = (text) => bcrypt.hashSync(text, saltSounds);

exports.comparePassword = (text, hash) => bcrypt.compare(text, hash);

exports.convertToTimeZone = (timestamp) => {
  const date = new Date(timestamp);
  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  const formattedDate = new Intl.DateTimeFormat("en-IN", options).format(date);
  return formattedDate;
};
