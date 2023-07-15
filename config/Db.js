const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI;

const connectDB=async()=>{
    try {
        
            await mongoose.connect(
                uri,
                {
                    useNewUrlParser: true
    
                }
            )
            console.log("mongoose connection open");
    } catch (error) {
        console.log(error.massage);
        
    }
    
}
module.exports=connectDB