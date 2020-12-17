exports.getIndex = (req, res, next) => {
    res.json({
        data: [
            {
                title: "A post"
            },
            {
                title: "B post"
            },
            {
                title: "C post"
            },
        ]
    })
}