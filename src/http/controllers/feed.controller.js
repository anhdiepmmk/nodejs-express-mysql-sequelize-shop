exports.getPosts = (req, res, next) => {
    res.status(200).json({
        data: [
            {
                title: "A post",
                content: "A content"
            },
            {
                title: "B post",
                content: "B content"
            },
            {
                title: "C post",
                content: "C content"
            },
        ]
    })
}

exports.createPost = (req, res, next) => {
    const title = req.body.title
    const content = req.body.content

    console.log('createPost', title, content);

    res.status(201).json({
        message: "Post created successfully!",
        posts: {
            id: new Date().toISOString(),
            title: title,
            content: content
        }
    })
}