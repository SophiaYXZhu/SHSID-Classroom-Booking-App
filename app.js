

App({
    onLaunch: function () {
        wx.cloud.init({
            env: "cloud1-3gjj5bae1cff079b",
        })
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } 
        else {
            wx.cloud.init({
            traceUser: true,
            })
        }
    },
    myapp:{
        //myweb: "http://localhost:912",
        myweb: "http://localhost:8888",
    },
})