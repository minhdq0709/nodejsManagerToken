"use  strict";
const mysql = require('mysql');
const dbconfig = require('../config/database.js');
const connection = mysql.createConnection(dbconfig.connection3);
const moment = require('moment');
const USER_LIVE = 1;
const USER_DIE = 100;
const CHANGE_PASSWORD = 101;
const USER_DIE_FOREVER = 102;
const PAGE_INVALIDATE = 105;
const formatTime = 'YYYY-MM-DD HH:mm:ss';

class Token{
    constructor(token){
        this.Token = token.Token,
        this.Note = token.Note,
        this.StatusToken = token.StatusToken,
        this.FanPageLink = token.FanPageLink,
        this.Manager = token.Manager,
        this.User = token.User,
        this.FanPageName = token.FanPageName,
        this.Cookies = token.Cookies
    }
}

class ManagerToken{
    static Create(token, callback){
        let query = "Insert into FacebookDb.fb_tokens(Token, Note, StatusToken, Manager, User, FanPageName, FanPageLink, Datetime_tokendie, Cookies) values ?";
        let values = [
            [token.Token, token.Note, 1, token.Manager, token.User, token.FanPageName, token.FanPageLink, new Date(), token.Cookies]
        ];

        connection.query(query, [values], function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        })
    }

    static GetListUserDie(manager, statusToken, callback){
        let query = `Select User, max(Token_type) as typeToken from FacebookDb.fb_tokens where 1 = 1`;
        if(manager){
            query += ` and Manager = '${manager}'`;
        }

        if(statusToken != 0){
            query += ` and StatusToken = ${statusToken}`;
        }

        query += ` group by User`;

        connection.query(query, function(err, result){
            if(err){
                callback(err, null);
                return;
            }

            return callback(null, result);
        });
    }

    static GetListAdminByNamePage(namePage, callback){
        let query = `SELECT distinct(User) FROM FacebookDb.fb_tokens where FanPageName = '${namePage}' and StatusToken in(1, 100, 101);`;
        connection.query(query, function(err, result){
            if(err){
                callback(err, null);
                return;
            }

            return callback(null, result);
        });
    }

    static GetTokenById(id, callback){
        let query = `Select * from FacebookDb.fb_tokens where Id = ?`;

        connection.query(query, [id],  function(err, result){
            if(err){
                callback(err, null);
                return;
            }

            return callback(null, result);
        });
    }

    static GetTokenByUser(userName, callback){
        let query = `Select id, FanPageName from FacebookDb.fb_tokens where User = ? and StatusToken = 101;`;

        connection.query(query, [userName],  function(err, result){
            if(err){
                callback(err, null);
                return;
            }

            return callback(null, result);
        });
    }

    static GetListPageBeenChangedPassword(manager, callback){
        let query = `Select Userl from FacebookDb.fb_tokens where StatusToken = 101`;
        if(manager){
            query += ` and Manager = '${manager}'`;
        }

        query += ` and User is not NULL group by User;`;

        connection.query(query, function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        });
    }

    static UpdateStatusToken(listToken, statusToken, callback){
        let query = ``;
        listToken.forEach(item=> {
            switch(statusToken){
                case USER_LIVE:{
                    query += `UPDATE FacebookDb.fb_tokens SET StatusToken = `;

                    if(item.typeToken){
                        query += `${USER_LIVE}`;
                    }
                    else{ // token new type is trying
                        query += `${CHANGE_PASSWORD}`;
                    }

                    query += `, Datetime_tokendie = '${moment(new Date()).format(formatTime)}' WHERE User = '${item.userName}' and statustoken != ${PAGE_INVALIDATE};`

                    break;
                }

                case USER_DIE_FOREVER:{
                    query += `UPDATE FacebookDb.fb_tokens SET StatusToken = ${USER_DIE_FOREVER}, 
                            Datetime_tokendie = '${moment(new Date()).format(formatTime)}' WHERE User = '${item.userName}' and statustoken != ${PAGE_INVALIDATE};`;

                    break;
                }
            }
        });

        connection.query(query, function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        });
    }

    static UpdatePasswordByUseName(userName, password, callback){
        let query = `UPDATE FacebookDb.fb_tokens SET Note = '${password}' WHERE User = '${userName}';`;
        
        connection.query(query, function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        });
    }

    static UpdateTokenById(token, id, callback){
        let query = `UPDATE FacebookDb.fb_tokens SET Token = '${token}', StatusToken = 1, Datetime_tokendie = '${moment(new Date()).format(formatTime)}' WHERE Id = ${id};`;
        
        connection.query(query, function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        });
    }

    static UpdateListToken(listToken, callback){
        let query = ``;
        listToken.forEach(elment=> {
            if(elment.Token.length){
                query += `UPDATE FacebookDb.fb_tokens SET Token = '${elment.Token}', StatusToken = 1, Datetime_tokendie = '${moment(new Date()).format(formatTime)}' WHERE Id = ${elment.Id};`;
            }
            else{
                query += `UPDATE FacebookDb.fb_tokens SET StatusToken = 105 WHERE Id = ${elment.Id};`;
            }
        })
        
        connection.query(query, function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        });
    }

    static GetListTotalAdminOfPage(callback){
        let query = `SELECT A.FanPageName, max(A.FanPageLink) as Link, 
                            max(A.manager) as UserName, count(A.User) as TotalAdmin
                        FROM FacebookDb.fb_tokens as A 
                    where StatusToken in(1, 101, 100) 
                    group by FanPageName 
                        having TotalAdmin < 4
                    order by TotalAdmin;`

        connection.query(query, function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        });
    }
}

module.exports = {Token, ManagerToken};
