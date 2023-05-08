// pages/teacher/check.js

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
        giveResponseList: [],
        processListEmpty: false,
        used: [],
        cleaned: [],
        checked: false,
    },

    async onShow(options) {
        let requestBuildings = [];
        let requestRooms = [];
        let requestDates = [];
        let requestTimes = [];
        let requestUsers = [];
        let requestIds = [];
        let used = [];
        let cleaned = [];
        const db = wx.cloud.database();
        await db.collection("reservations")
        .where({
            building: wx.getStorageSync("building"), // load from wx.getStorageSync('building') from teacher/teacher.js
            status: 0,
            teacherStatus: 1, // accepted
            // status: 2, // TODO: uncomment, event ended
            cleaned: null,
            used: null
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
                requestIds[index] = item._id;
                used[index] = null,
                cleaned[index] = null
            })
            this.setData({
                buildings: requestBuildings,
                rooms: requestRooms,
                dates: requestDates,
                times: requestTimes,
                users: requestUsers,
                ids: requestIds,
                used: used,
                cleaned: cleaned
            })
        })
        .catch(err => {
            console.log("load data fail", err)
        })
        if (this.data.ids.length == 0) {
            console.log("empty")
            this.setData({
                processListEmpty: true
            })
        }
    },

    onPullDownRefresh() {
        this.onShow();
    },

    tapUseYes: function(e) {
        let idx = e.currentTarget.dataset.index;
        let used = this.data.used;
        used[idx] = true
        this.setData({
            used: used,
        })
    },

    tapUseNo: function(e) {
        let idx = e.currentTarget.dataset.index;
        let used = this.data.used;
        used[idx] = false
        this.setData({
            used: used,
        })
    },

    tapCleanYes: function(e) {
        let idx = e.currentTarget.dataset.index;
        let cleaned = this.data.cleaned;
        cleaned[idx] = true
        this.setData({
            cleaned: cleaned,
        })
    },
    
    tapCleanNo: function(e) {
        let idx = e.currentTarget.dataset.index;
        let cleaned = this.data.cleaned;
        cleaned[idx] = false
        this.setData({
            cleaned: cleaned,
        })
    },

    tapSubmit(e) {
        const db = wx.cloud.database();
        let idx = e.currentTarget.dataset.index;
        let used = this.data.used[idx];
        let cleaned = this.data.cleaned[idx];
        let id = this.data.ids[idx];
        if (used == null || (used == true && cleaned == null)) {
            wx.showModal({
                title: "Warning",
                content: "未选择全部条目",
                showCancel: false,
            })
        }
        else {
            let that = this
            wx.showModal({
                title: "Submit",
                content: "提交反馈？",
                success(res) {
                    if (res.confirm) {
                        db.collection("reservations")
                        .doc(id)
                        .update({
                            data: ({
                                used: used,
                                cleaned: cleaned
                            })
                        })
                        .then(res => {
                            console.log("Accept success", res);
                            that.setData({
                                checked: false
                            })
                            that.onShow()
                        }).catch(e => {
                            console.log("Accept failed", e);
                        })
                    }
                }
            })
        }
    }
})