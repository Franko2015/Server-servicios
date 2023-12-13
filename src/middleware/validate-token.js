import jwt from 'jsonwebtoken';

const validateToken = (req, res, next) => {
 const headerToken = req.headers['authorization'];
 if (headerToken == undefined && headerToken.startsWith('Bearer ')) {
  res.status(401).json({ msg: 'No autorizado' });
 } else {
  const token = headerToken.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET || 'UnAsadito', (err, decoded) => {
   if (err) {
    res.status(401).json({ msg: 'No autorizado' });
   } else {
    req.decoded = decoded;
    next();
   }
  });
 }
}

export default validateToken;

