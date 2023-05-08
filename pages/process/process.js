// pages/process/process.js

Page({
    /**
     * 页面的初始数据
     */
    data: {
        buildings: [],
        rooms: [],
        dates: [],
        times: [],
        ids: [],
        processListEmpty: false,
        uncleanedCounts: null,
        unusedCounts: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) {
        const db = wx.cloud.database();
        let requestBuildings = [];
        let requestRooms = [];
        let requestDates = [];
        let requestTimes = [];
        let requestUsers = [];
        let requestIds = [];
        let clubs = new Set();
        let that = this
        await db.collection("reservations")
        .where({
            building: wx.getStorageSync("building"), // load from wx.getStorageSync('building') from teacher/teacher.js
            status: 0,
            teacherStatus: -1,
        })
        .get()
        .then(res => {
            let list = res.data;
            list.forEach(function (item, index) {
                requestBuildings[index] = item.building;
                requestRooms[index] = item.room;
                requestDates[index] = item.Date;
                requestTimes[index] = item.time;
                requestUsers[index] = item.user;
                clubs.add(item.user)
                requestIds[index] = item._id;
            })
            this.setData({
                buildings: requestBuildings,
                rooms: requestRooms,
                dates: requestDates,
                times: requestTimes,
                users: requestUsers,
                ids: requestIds
            })
            let uncleanedCounts = {}
            let unusedCounts = {}
            console.log("clubs", clubs, clubs[0])
            clubs.forEach (function(club) {
                db.collection("reservations").where({
                    user: club,
                    // status: 2 // only check event that has ended
                })
                .get({
                    success(res) {
                        let uncleanedCount = 0
                        let unusedCount = 0
                        for (let j = 0; j < res.data.length; j++) {
                            if (res.data[j].cleaned == false){
                                uncleanedCount ++
                            }
                            if (res.data[j].used == false){
                                unusedCount ++
                            }
                        }
                        uncleanedCounts[club] = uncleanedCount
                        unusedCounts[club] = unusedCount
                        if (Object.keys(uncleanedCounts).length == clubs.size && Object.keys(unusedCounts).length == clubs.size) {
                            console.log(uncleanedCounts)
                            console.log(unusedCounts)
                            that.setData({
                                uncleanedCounts: uncleanedCounts,
                                unusedCounts: unusedCounts,
                            })
                        }
                    }
                })
            })
        })
        .catch(err => {
            console.log("load data fail", err)
        })
        if (this.data.ids.length == 0) {
            this.setData({
                processListEmpty: true
            })
        }
    },

    // 传parameter很有可能出错
    // https://wenku.baidu.com/view/2a99c801f9d6195f312b3169a45177232f60e4dc.html?_wkts_=1667821750507&bdQuery=%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F%E6%8C%89%E9%92%AE%E4%BC%A0%E8%BE%93%E5%8F%82%E6%95%B0
    async onBindAccept(e) {
        const db = wx.cloud.database();
        let idx = e.currentTarget.dataset.index;
        let that = this;
        let club = this.data.users[idx];
        let idClub = "";
        let originalCount = 0;
        this.setData({
            processingIdx: idx
        })
        let id = this.data.ids[idx];
        // Get the id of processed club and the number of reservations
        await db.collection("clubs")
        .where({
            clubName: club
        })
        .get()
        .then(res => {
            let data = res.data[0];
            idClub = data._id;
            originalCount = data.originalCount;
        })
        db.collection("reservations")
        .doc(id)
        .update({
            data: ({
                teacherStatus: 1 // 1 stands for accepted
            })
        }).then(res => {
            console.log("Accept success", res);
            // Update the number of reservations
            db.collection("clubs")
            .doc(idClub)
            .update({
                data: {
                    bookCount: originalCount - 1
                },
                success: function(res) {
                    console.log("Number of bookings updated", res)
                }
            })
            that.onLoad();
        }).catch(e => {
            console.log("Accept failed", e);
        })
    },

    onBindReject(e) {
        const db = wx.cloud.database();
        let idx = e.currentTarget.dataset.index;
        let id = this.data.ids[idx];
        let that = this;
        let idClub = "";
        let club = this.data.users[idx];
        let originalCount = 0;
        // Get the id of processed club and the number of reservations
        db.collection("clubs")
        .where({
            clubName: club
        })
        .get()
        .then(res => {
            let data = res.data[0];
            idClub = data._id;
            originalCount = data.originalCount;
        })
        // Save teacher status
        db.collection("reservations")
        .doc(id)
        .update({
            data: {
                teacherStatus: 2 // 2 stands for denied
            }
        }).then(res => {
            console.log("Accept success", res);
            // Update the number of reservations
            wx.cloud.database().collection("clubs")
            .doc(idClub)
            .update({
                data: {
                    bookCount: originalCount - 1
                },
                success: function(res) {
                    console.log("Number of bookings updated", res)
                }
            })
            })
        wx.setStorageSync('id', id)
        wx.navigateTo({
            url: "./reject",
            success: function(res) {
                console.log("success");
                that.onLoad();
            },
            fail: function(res) {
                console.log("fail");
            }
        });
    },

    onPullDownRefresh() {
        this.onLoad();
    }
})
