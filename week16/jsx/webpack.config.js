module.exports = {
    entry: "./main.js",
    module:{
        rules:[
            {
                test:/\.js$/,
                use:{
                    loader: "babel-loader",
                    options:{
                        presets:["@babel/preset-env"],
                        plugins:[["@babel/plugin-transform-react-jsx", {pragma:"createElement"}]]
                    }
                }
            },
            // {
            //     test:/\.view/,
            //     use:{
            //         loader:require.resolve("./myloader.js")
            //     }
            // },
            // {
            //     test:/\.css$/,
            //     user:{
            //         loader:require.resolve("./cssloader.js")
            //     }
            // }
        ]
    },
    mode: "development",
    optimization:{
        minimize: false
    }



    // devtool: 'inline-source-map',
    // devServer: {
    //     contentBase: './dist'
    // },
    // devServer: {
    //     contentBase: path.join(__dirname, "dist"),
    //     compress: true,
    //     port: 9000
    //   }

}