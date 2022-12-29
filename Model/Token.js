"use  strict";
const mysql = require('mysql');
const moment = require('moment');
const dbconfig = require('../config/database.js');

const connection = mysql.createConnection(dbconfig.connection2);
const USER_LIVE = 1;
const USER_DIE = 100;
const CHANGE_PASSWORD = 101;
const USER_DIE_FOREVER = 102;
const PAGE_INVALIDATE = 105;
const PAGE_CLASSIC = 0;
const GET_TOKEN_BY_INSTAGRAM = 1;
const GET_BY_COOKIE = 2;
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
        this.Cookies = token.Cookies,
        this.TypeToken = token.TypeToken,
        this.IsPageOwner = token.IsPageOwner,
        this.ServerName = token.ServerName
    }
}

class ManagerToken{
    static Create(token, callback){
        let query = "Insert into FacebookDb.fb_tokens(Token, Note, StatusToken, Manager, User, FanPageName, " +
            "FanPageLink, Datetime_tokendie, Cookies, Token_type, Is_Page_Owner, Datetime_Token_Opened, ServerName) values ?";
        let values = [
            [
                token.Token, token.Note, USER_LIVE, token.Manager, token.User, token.FanPageName, 
                token.FanPageLink, new Date(), token.Cookies, token.TypeToken, token.IsPageOwner,
                new Date(), token.ServerName
            ]
        ];

        connection.query(query, [values], function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        })
    }

    static CreateTokenTableYt_Tiktok(listToken, callback){
        let query = "Insert into FacebookDb.Token_YT_Tiktok(Token, Status_) values ?";

        connection.query(query, [listToken], function(err, result){
            if(err){
                console.log(err);
                return callback(err, null);
            }

            return callback(null, result);
        })
    }

    static GetListUserDie(manager, statusToken, callback){
        let query = `Select User, GROUP_CONCAT(Token_type SEPARATOR ',') as typeToken, 
                        if(Max(ServerName) IS NULL, '', Max(ServerName)) as ServerName 
                    from FacebookDb.fb_tokens where 1 = 1`;
                    
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
        let query = `SELECT distinct(User) FROM FacebookDb.fb_tokens where FanPageName = '${namePage}' and StatusToken in(${USER_LIVE}, ${USER_DIE}, ${CHANGE_PASSWORD});`;
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

    static GetTokenByManager(manager, callback){
        let query = 
            `select count(*) as tokenInMonth 
                from FacebookDb.fb_tokens
            where manager = '${manager}'
                and MONTH(datetime_create_token) = MONTH(now())
                and YEAR(datetime_create_token) = YEAR(now())
                and StatusToken in (${USER_LIVE}, ${USER_DIE}, ${CHANGE_PASSWORD})
            union
            select count(*) as totalToken
                from FacebookDb.fb_tokens
            where manager = '${manager}'
                and StatusToken in (${USER_LIVE}, ${USER_DIE}, ${CHANGE_PASSWORD});`

        connection.query(query,  function(err, result){
            if(err){
                callback(err, null);
                return;
            }

            return callback(null, result);
        });
    }

    static GetStatisticToken(callback){
        let query = 
            `select count(*) as total_token, StatusToken 
                from FacebookDb.fb_tokens 
            where StatusToken in (${USER_LIVE}, ${USER_DIE}, ${CHANGE_PASSWORD}) 
            group by StatusToken;`

        connection.query(query,  function(err, result){
            if(err){
                callback(err, null);
                return;
            }

            return callback(null, result);
        });
    }

    static GetStatisticTokenByManager(manager, callback){
        let query = 
            `select count(*) as token, StatusToken
                from FacebookDb.fb_tokens
            where Manager = '${manager}'
                and StatusToken in (${USER_LIVE}, ${USER_DIE}, ${CHANGE_PASSWORD})
            group by StatusToken;`

        connection.query(query,  function(err, result){
            if(err){
                callback(err, null);
                return;
            }

            return callback(null, result);
        });
    }

    static GetTokenByUser(userName, callback){
        let query = `Select id, FanPageName, Token_type from FacebookDb.fb_tokens where User = ? and StatusToken = ${CHANGE_PASSWORD} order by Token_type desc;`;

        connection.query(query, [userName],  function(err, result){
            if(err){
                callback(err, null);
                return;
            }

            return callback(null, result);
        });
    }

    static GetListPageBeenChangedPassword(manager, callback){
        let query = `Select User, max(ServerName) as ServerName from FacebookDb.fb_tokens where StatusToken = ${CHANGE_PASSWORD}`;
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
        const updateQueryConst = `UPDATE FacebookDb.fb_tokens SET StatusToken = `;
        const dateNow = moment(new Date()).format(formatTime);

        listToken.forEach(item=> {
            switch(statusToken){
                case USER_LIVE:{

                    if(item.typeToken.includes(`${GET_TOKEN_BY_INSTAGRAM.toString()}`) || item.typeToken.includes(`${GET_BY_COOKIE.toString()}`)){
                        query += `${updateQueryConst} ${CHANGE_PASSWORD} WHERE Token_type != 0 and User = '${item.userName}' and statustoken != ${PAGE_INVALIDATE};`;
                    }

                    if(item.typeToken.includes(`${PAGE_CLASSIC.toString()}`)){
                        query += `${updateQueryConst} ${USER_LIVE}, Datetime_Token_Opened = '${dateNow}' WHERE User = '${item.userName}' and statustoken != ${PAGE_INVALIDATE} and Token_type not in (1, 2);`
                    }

                    break;
                }

                case USER_DIE_FOREVER:{
                    query += `UPDATE FacebookDb.fb_tokens SET StatusToken = ${USER_DIE_FOREVER}, 
                            Datetime_tokendie = '${dateNow}' WHERE User = '${item.userName}' and statustoken != ${PAGE_INVALIDATE};`;

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
        let query = `UPDATE FacebookDb.fb_tokens SET Token = '${token}', 
            StatusToken = ${USER_LIVE}, 
            Datetime_Token_Opened = '${moment(new Date()).format(formatTime)}' 
            WHERE Id = ${id};`;
        
        connection.query(query, function(err, result){
            if(err){
                return callback(err, null);
            }

            return callback(null, result);
        });
    }

    static UpdateListToken(listToken, callback){
        let query = ``;
        const dateNow = moment(new Date()).format(formatTime);

        listToken.forEach(elment=> {
            if(elment.Token.length){
                query +=    `UPDATE FacebookDb.fb_tokens SET Token = '${elment.Token}',`;
                query +=        `StatusToken = ${USER_LIVE},`;
                query +=        `Datetime_Token_Opened = '${dateNow}',`;
                query +=        `Cookies = '${elment.Cookie}' `;
                query +=    `WHERE Id = ${elment.Id};`;
            }
            else{
                query += `UPDATE FacebookDb.fb_tokens SET StatusToken = ${PAGE_INVALIDATE} WHERE Id = ${elment.Id};`;
            }
        })

        connection.query(query, function(err, result){
            if(err){
                console.log("err: ", err);
                return callback(err, null);
            }

            return callback(null, result);
        });
    }

    static GetListTotalAdminOfPage(callback){
        let query = `SELECT A.FanPageName, max(A.FanPageLink) as Link, 
                            max(A.manager) as UserName, count(A.User) as TotalAdmin
                        FROM FacebookDb.fb_tokens as A 
                    where StatusToken in(${USER_LIVE}, ${USER_DIE}, ${CHANGE_PASSWORD}) 
                    and Token_type != 2 
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