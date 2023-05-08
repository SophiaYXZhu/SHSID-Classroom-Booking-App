// pages/profile/profile.js


Page({
    /**
     * 页面的初始数据
     */
    data: {
        club: "",
        buildings: [],
        rooms: [],
        dates: [],
        timings: [],
        timeStatus: [],
        teacherStatus: [],
        rejectReason: [],
        used: [],
        cleaned: [],
        idClub: "",
        originalCount: 0
    },

    onShow: function(option) {
        let clubName = wx.getStorageSync("clubName");
        this.setData({
            club: clubName
        })
        let buildingBooked = [];
        let roomBooked = [];
        let dateBooked = [];
        let timingBooked = [];
        let idsBooked = [];
        let years = [];
        let months = [];
        let dates = [];
        let timeStatus = []; // 0 is not started yet, 1 is during event, 2 is event finished
        let teacherStatus = []; // -1 is for pending, 1 is for accepted, 2 is for denied
        let rejectReason = [];
        let used = [];
        let cleaned = [];
        let tmp = [];

        var timestamp = Date.parse(new Date());
        var date = new Date(timestamp);
        let YEAR = date.getFullYear()
        let MONTH = parseInt(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)
        let DATE = parseInt(date.getDate() < 10 ? '0' + date.getDate() : date.getDate())
        let HOUR = date.getHours()
        let MINUTE = date.getMinutes()
        const db = wx.cloud.database();
        console.log("in profile", this.data.club)
        db.collection("reservations")
        .where({
            user: clubName
        })
        .get()
        .then(res => {
            let list = res.data;
            console.log("profile list", list)
            list.forEach(function (item, index) {
                buildingBooked[index] = item.building;
                roomBooked[index] = item.room;
                dateBooked[index] = item.Date;
                timingBooked[index] = item.time;
                idsBooked[index] = item._id;
                teacherStatus[index] = item.teacherStatus;
                rejectReason[index] = item.rejectReason;
                used[index] = item.used;
                cleaned[index] = item.cleaned;
                years[index] = parseInt(item.Date.split("/")[2]);
                months[index] = parseInt(item.Date.split("/")[0]);
                dates[index] = parseInt(item.Date.split("/")[1]);
                tmp = item.time.split("~")
                tmp[0] = tmp[0].split(":")
                tmp[0][0] = parseInt(tmp[0][0])
                tmp[0][1] = parseInt(tmp[0][1])
                tmp[1] = tmp[1].split(":")
                tmp[1][0] = parseInt(tmp[1][0])
                tmp[1][1] = parseInt(tmp[1][1])
                // check if the time is before the event starts
                if (years[index] > YEAR ||
                    years[index] == YEAR && months[index] > MONTH ||
                    years[index] == YEAR && months[index] == MONTH && dates[index] > DATE ||
                    years[index] == YEAR && months[index] == MONTH && dates[index] == DATE && tmp[0][0] > HOUR ||
                    years[index] == YEAR && months[index] == MONTH && dates[index] == DATE && tmp[0][0] == HOUR && tmp[0][1] > MINUTE
                    ) {
                    timeStatus[index] = 0;
                }
                // check if the time is after the event ended
                else if (years[index] < YEAR ||
                    years[index] == YEAR && months[index] < MONTH ||
                    years[index] == YEAR && months[index] == MONTH && dates[index] < DATE ||
                    years[index] == YEAR && months[index] == MONTH && dates[index] == DATE && tmp[1][0] < HOUR ||
                    years[index] == YEAR && months[index] == MONTH && dates[index] == DATE && tmp[1][0] == HOUR && tmp[1][1] > MINUTE
                    ) {
                    timeStatus[index] = 2;
                }
                // else the time is during the event
                else {
                    timeStatus[index] = 1;
                }
            })
            this.setData({
                buildings: buildingBooked,
                rooms: roomBooked,
                dates: dateBooked,
                timings: timingBooked,
                ids: idsBooked,
                timeStatus: timeStatus,
                teacherStatus: teacherStatus,
                rejectReason: rejectReason,
                used: used,
                cleaned: cleaned
            })
        })
        .catch(err => {
            console.log("load data fail", err)
        })
        // Get club database id
        wx.cloud.database().collection("clubs")
            .where({
                clubName: clubName
            })
            .get()
            .then(res => {
                let data = res.data[0];
                this.setData({
                    idClub: data._id,
                    originalCount: data.bookCount
                })
            })
    },

    onBindExp(e) {
        wx.switchTab({
            url: "./explain",
            success: function(res) {
                console.log(res);
            }
        })
    },

    onBindDelete(e) {
        let idx = e.currentTarget.dataset.index;
        let id = this.data.ids[idx];
        let idClub = this.data.idClub;
        let that = this;
        let timeStatus = this.data.timeStatus[idx];
        let teacherStatus = this.data.teacherStatus[idx];
        let originalCount = this.data.originalCount;
        const db = wx.cloud.database();
        db.collection("reservations").doc(id)
        .remove()
        .then(res => {
            console.log("Delete success", res);
            // Update the number of reservations
            if (timeStatus == 0 && teacherStatus == -1) {
                wx.cloud.database().collection("clubs")
                .doc(idClub)
                .update({
                    data: {
                        bookCount: originalCount - 1
                    },
                    success: function(res) {
                        console.log("bookCount updated", res)
                    }
                })
            }
            that.onShow()
        })
        .catch (e => {
            console.log("Delete failed", e);
        })
    },

    onBindEdit(e) {
        wx.navigateTo({
            url: "./edit"
        })
    },

    onBindLogout(e) {
        wx.clearStorageSync();
        wx.redirectTo({
            url: "../login/login"
        })
    },

    onPullDownRefresh() {
        this.onShow();
    }
})
