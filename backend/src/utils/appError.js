class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    ((this.statusCode = statusCode),
     (this.success = false));
    Error.captureStackTrace(this, this.constructor); // error ka line of code trace krna kaha se error aa rhahai 
  }
}

export default AppError;
