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
        let query = "Insert into FacebookDb.fb_tokens(Token, Note, StatusToken, Manager, User, FanPageName, FanPageLink) values ?";
        let values = [
            [token.Token, token.Note, 1, token.Manager, token.User, token.FanPageName, token.FanPageLink]
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
        let query = `Select User from FacebookDb.fb_tokens where StatusToken = 101`;
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

    static UpdateStatusToken(idList, statusToken, callback){
        let query = `UPDATE FacebookDb.fb_tokens SET StatusToken = ${statusToken} WHERE User in (?) and statustoken != 105;`;
        
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
        let query = `UPDATE FacebookDb.fb_tokens SET Token = '${token}', StatusToken = 1 WHERE Id = ${id};`;
        
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
                query += `UPDATE FacebookDb.fb_tokens SET Token = '${elment.Token}', StatusToken = 1 WHERE Id = ${elment.Id};`;
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
        let query = `SELECT A.FanPageName, max(A.FanPageLink ) as Link, 
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
