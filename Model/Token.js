"use  strict";
const mysql = require('mysql');
const dbconfig = require('../config/database.js');
const connection = mysql.createConnection(dbconfig.connection);

class Token{
    constructor(token){
        this.Token = token.Token,
        this.Note = token.Note,
        this.StatusToken = token.StatusToken,
        this.Manager = token.Manager,
        this.User = token.User,
        this.FanPageName = token.FanPageName
    }
}

class ManagerToken{
    static Create(token, callback){
        let query = "Insert into token.fb_token(Token, Note, StatusToken, Manager, User, FanPageName) values ?";
        let values = [
            [token.Token, token.Note, 1, token.Manager, token.User, token.FanPageName]
        ];

        connection.query(query, [values], function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        })
    }

    static GetListUserDie(manager, statusToken, callback){
        let query = `Select User, group_concat(id SEPARATOR ', ') as Id from Token.fb_token where 1 = 1`;
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

    static GetTokenById(id, callback){
        let query = `Select * from Token.fb_token where Id = ?`;

        connection.query(query, [id],  function(err, result){
            if(err){
                callback(err, null);
                return;
            }

            return callback(null, result);
        });
    }

    static GetListPageBeenChangedPassword(manager, callback){
        let query = `Select * from Token.fb_token where StatusToken = 101`;
        if(manager){
            query += ` and Manager = '${manager}'`;
        }

        connection.query(query, function(err, result){
            if(err){

                return callback(err, null);
            }

            return callback(null, result);
        });
    }

    static UpdateStatusToken(idList, statusToken, callback){
        let query = `UPDATE token.fb_token SET StatusToken = ${statusToken} WHERE User in (?)`;

        connection.query(query, [idList], function(err, result){
            if(err){
               return callback(err, null);
            }

            return callback(null, result);
        });
    }

    static UpdatePasswordByUseName(userName, password, callback){
        let query = `UPDATE token.fb_token SET Note = '${password}' WHERE User = '${userName}';`;
        
        connection.query(query, function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        });
    }

    static UpdateTokenById(token, id, callback){
        let query = `UPDATE token.fb_token SET Token = '${token}', StatusToken = 1 WHERE Id = '${id}';`;
        
        connection.query(query, function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        });
    }
}

module.exports = {Token, ManagerToken};
