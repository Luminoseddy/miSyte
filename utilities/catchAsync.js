// We can now use this to wrap around async funcions.

// func is what we pass in 
module.exports = func => {
     // return a function that accepts a function 'return { _ }' then . 
    return (req, res, next) => {  
        func(req, res, next).catch(next) // executes the function, catches error if any, then passes to next function.
    }
}


// checked 