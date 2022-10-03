"use  strict";
const mysql = require('mysql');
const dbconfig = require('../config/database.js');
const connection = mysql.createConnection(dbconfig.connection2);

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
        let query = "Insert into FacebookDb.fb_tokens(Token, Note, StatusToken, Manager, User, FanPageName) values ?";
        let values = [
            [token.Token, token.Note, 1, social_index_v2.Manager, token.User, token.FanPageName]
        ];

        connection.query(query, [values], function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        })
    }

    static GetListUserDie(manager, statusToken, callback){
        let query = `Select User, group_concat(id SEPARATOR ', ') as Id from FacebookDb.fb_tokens where 1 = 1`;
        if(manager){
            query += ` and Manager = '${manager}'`;
        }

        if(statusToken != 0){
            query += ` and StatusToken = ${statusToken}`;
        }

        query += ` group by User`;

        console.log("query: ", query);
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

    static GetListPageBeenChangedPassword(manager, callback){
        let query = `Select * from FacebookDb.fb_tokens where StatusToken = 101`;
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
        let query = `UPDATE FacebookDb.fb_tokens SET StatusToken = ${statusToken} WHERE User in (?)`;

        connection.query(query, [idList], function(err, result){
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
        let query = `UPDATE FacebookDb.fb_tokens SET Token = '${token}', StatusToken = 1 WHERE Id = '${id}';`;
        
        connection.query(query, function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        });
    }
}

module.exports = {Token, ManagerToken};
