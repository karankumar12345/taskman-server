
export const errorMiddleWare=(err,req,res,next)=>{
    err.statusCode=err.statusCode||500;
    err.message=err.message||"Internal Server Error";
 
 if(err.name==="CastError"){
    const message=`Resource not found. Invalid: ${err.path}`;
    err=new ErrorHandler(message,400);
 }
 if(err.code===11000){
    const message=`Duplicate ${Object.keys(err.keyValue)} Entered`;
    err=new ErrorHandler(message, 400);
 }
 
    // Handling JWT errors (invalid token)
    if (err.name === "JsonWebTokenError") {
        err.message = "JSON Web Token is invalid, try again";
        err.statusCode = 400; // Set specific status code
    }

    // Handling expired JWT token
    if (err.name === "TokenExpiredError") {
        err.message = "JSON Web Token is expired, try again";
        err.statusCode = 400; // Set specific status code
    }

    // Validate the status code
    const statusCode = typeof err.statusCode === 'number' && err.statusCode >= 100 && err.statusCode <= 599
        ? err.statusCode
        : 500; // Default to 500 for invalid status codes

    // Sending error response
    res.status(statusCode).json({
        success: false,
        message: err.message,
    });
}