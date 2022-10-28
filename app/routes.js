"use strict"
const { json } = require("body-parser");
const { Token, ManagerToken } = require("../Model/Token");

module.exports = function (app, passport) {

	app.get('/', function (req, res) {
		res.redirect('/login');
	});

	app.get('/login', function (req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	app.post('/login', passport.authenticate('local-login', {
		failureRedirect: '/login',
		failureFlash: true
	}),
		function (req, res) {
			res.cookie(
				'cookiename',
				req.body.username, 
				{ 
					maxAge: 365 * 24 * 60 * 60 * 1000, // a year
					httpOnly: false
				}
			);

			return res.redirect('/home');
		}
	);

	app.get('/user_die', isLoggedIn, function (req, res) {
		res.render('user_die.ejs');
	});

	app.get('/home', isLoggedIn, function (req, res) {
		res.render('home.ejs');
	});

	app.get('/getListToltalAdminOfPage', isLoggedIn, function (req, res) {
		ManagerToken.GetListTotalAdminOfPage((err, result)=> {
			let jsonData = {};
			if (err) {
				jsonData.status = 500;
				jsonData.Mess = "Có lỗi xảy ra";
			}
			else {
				jsonData.status = 200;
				jsonData.Mess = result;
			}

			return res.json(jsonData);
		});
	});

	app.get('/user_block_forever', isLoggedIn, function (req, res) {
		res.render('user_die_forever.ejs');
	});

	app.get('/create_token', isLoggedIn, function (req, res) {
		res.render('create_token.ejs');
	});

	app.post('/create_token', isLoggedIn, function (req, res) {
		const token = new Token(req.body);

		ManagerToken.Create(token, (err, result)=> {
			let jsonData = {};

			if (err) {
				jsonData.status = 500;
				jsonData.Mess = "Có lỗi xảy ra";
			}
			else {
				jsonData.status = 200;
				jsonData.Mess = result;
			}

			res.json(jsonData);
		});
	});

	app.get('/getUserDieByManager/:manager/:statusToken', function (req, res) {
		let manager = req.params.manager;
		let statusToken = +req.params.statusToken;

		ManagerToken.GetListUserDie(manager, statusToken, (err, data) => {
			let jsonData = {};
			if (err) {
				jsonData.status = 500;
				jsonData.Mess = "Có lỗi xảy ra";
			}
			else {
				jsonData.status = 200;
				jsonData.Mess = data;
			}

			res.json(jsonData);
		});
	});

	app.get('/getListAdminByPage/:namePage', function (req, res) {
		let namePage = req.params.namePage;

		ManagerToken.GetListAdminByNamePage(namePage, (err, data) => {
			let jsonData = {};
			if (err) {
				jsonData.status = 500;
				jsonData.Mess = "Có lỗi xảy ra";
			}
			else {
				jsonData.status = 200;
				jsonData.Mess = data;
			}

			res.json(jsonData);
		});
	});

	app.get('/getUserChangePasswordByManager/:manager', function (req, res) {
		let manager = req.params.manager;

		ManagerToken.GetListPageBeenChangedPassword(manager, (err, data) => {
			let jsonData = {};

			if (err) {
				jsonData.status = 500;
				jsonData.Mess = "Có lỗi xảy ra";
			}
			else {
				jsonData.status = 200;
				jsonData.Mess = data;
			}

			res.json(jsonData);
		});
	});

	app.get('/GetTokenById/:id', function (req, res) {
		let id = req.params.id;

		ManagerToken.GetTokenById(id, (err, data) => {
			let jsonData = {};

			if (err) {
				jsonData.status = 500;
				jsonData.Mess = "Có lỗi xảy ra";
			}
			else {
				jsonData.status = 200;
				jsonData.Mess = data;
			}

			res.json(jsonData);
		});
	});

	app.get('/GetTokenByUser/:userName', function (req, res) {
		let userName = req.params.userName;

		ManagerToken.GetTokenByUser(userName, (err, data) => {
			let jsonData = {};

			if (err) {
				jsonData.status = 500;
				jsonData.Mess = "Có lỗi xảy ra";
			}
			else {
				jsonData.status = 200;
				jsonData.Mess = data;
			}

			res.json(jsonData);
		});
	});

	app.get('/change_password', isLoggedIn, function (req, res) {
		res.render('change_password.ejs');
	});

	app.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	app.post('/updateStatusToken/:statusToken', function (req, res) {
		let listUserName = req.body.mess;
		let statusToken = +req.params.statusToken;

		ManagerToken.UpdateStatusToken(listUserName, statusToken, (err, data) => {
			let jsonData = {};

			if (err) {
				jsonData.status = 500;
				jsonData.Mess = "Có lỗi xảy ra";
			}
			else {
				jsonData.status = 200;
				jsonData.Mess = "Thành công";
			}

			res.json(jsonData);
		});
	});

	app.post('/updatePasswordByUsername', function (req, res) {
		let data = req.body;

		ManagerToken.UpdatePasswordByUseName(data.UserName, data.Password, (err, data) => {
			let jsonData = {};

			if (err) {
				jsonData.status = 500;
				jsonData.Mess = "Có lỗi xảy ra";
			}
			else {
				jsonData.status = 200;
				jsonData.Mess = "Thành công";
			}

			res.json(jsonData);
		});
	});

	app.post('/updateTokenById', function (req, res) {
		let data = req.body;

		ManagerToken.UpdateTokenById(data.Token, data.Id, (err, result) => {
			let jsonData = {};

			if (err) {
				jsonData.status = 500;
				jsonData.Mess = "Có lỗi xảy ra";
			}
			else {
				jsonData.status = 200;
				jsonData.Mess = "Thành công";
			}

			res.json(jsonData);
		});
	});

	app.post('/updateListToken', function (req, res) {
		let data = req.body;

		ManagerToken.UpdateListToken(data, (err, result) => {
			let jsonData = {};

			if (err) {
				jsonData.status = 500;
				jsonData.Mess = "Có lỗi xảy ra";
			}
			else {
				jsonData.status = 200;
				jsonData.Mess = "Thành công";
			}

			res.json(jsonData);
		});
	});
};

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('/');
}
