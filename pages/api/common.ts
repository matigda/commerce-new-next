import nc from 'next-connect';
import session from 'express-session';

const handler = nc();
// .use(session({
//     secret: 'xca$@##Dfsd432k',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 60000 }
// }));

export default handler;
