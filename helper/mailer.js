var nodemailer = require('nodemailer');

var transport = nodemailer.createTransport( {
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAILPASS
    }
});

module.exports = {
	sendMail: async (data,cb)=> {
		// console.log("=========data===",data.to)
		var message = {
			from: 'Snaxsmart',
			to: data.to,
			subject: data.subject
		};
    
		if(data.text) message.text = data.text;
		if(data.html) message.html=data.html;

		transport.sendMail(message, function(error){
			if(error){
				console.log("send mail error--",error)
				cb(error);
			}else{
				cb(null, {status:1})
			}
		});
	}
}