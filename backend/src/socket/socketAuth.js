import jwt from "jsonwebtoken";

const socketAuth = (socket, next) => {
  try {
    let token;

    // Check header or query string
    if (socket.handshake.auth && socket.handshake.auth.token) {
      token = socket.handshake.auth.token;
    } else if (socket.handshake.query && socket.handshake.query.token) {
      token = socket.handshake.query.token;
    }

    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to socket
    socket.user = {
      userId: decoded.userId,
      role: decoded.role,
      city: decoded.city, // Extracted for regional rooms
    };

    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid or expired token"));
  }
};

export default socketAuth;
