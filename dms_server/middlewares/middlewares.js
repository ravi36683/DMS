import {
    verifyJwt,
    verifyJwtAdmin
} from '../functions/functions';

export const userAuthCheck = async (req, res, next) => {
    try {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(' ')[0] === 'Bearer'
      ) {
        const token = req.headers.authorization.split(' ')[1];
        const isTokenValid = await verifyJwt(token);
        console.log('isTokenValid',isTokenValid)
        if (isTokenValid) {
          req.body.tokenData = isTokenValid;
          next();
        } else {
          res.send({
            code: 400,
            msg: 'Authentication is required',
          });
        }
      } else {
        res.send({
          code: 400,
          msg: 'Authentication is required',
        });
      }
    } catch (e) {
      res.send({
        code: 444,
        msg: 'Some error has occured!',
      });
    }
  };

export const adminAuthCheck = async (req, res, next) => {
    try {
        const cookie = req.signedCookies
        const isCookieValid = await verifyJwtAdmin(cookie.adminToken)
        if (isCookieValid) {
            console.log('here')
            next()
        } else {
            res.send({
                code: 400,
                msg: 'Authentication is required'
            })
        }
    } catch (e) {
        res.send({
            code: 444,
            msg: 'Some error has occured!'
        })
    }
}

export const adminAuthCheckParam = async (req, res, next) => {
    const tokenData = await verifyJwtAdmin(req.params.adminToken)
    if (tokenData) {
        next()
    } else {
        res.status(200).json({
            code: 400,
            msg: 'Not Authenticated'
        })
    }
}