const Article =
require("../models/Article");

exports.createNews =
async(req,res)=>{

    const article =
    await Article.create({
        ...req.body,
        author:req.user.id
    });

    io.emit(
        "news-created",
        article
    );

    res.status(201).json(article);
}