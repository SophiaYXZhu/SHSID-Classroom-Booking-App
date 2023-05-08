// pages/teacher/suspend.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        grade: "",
        clubNames: [],
        cnNames: [],
        emails: [],
        teachers: [],
        classes: [],
        ids: [],
        statuses: [],
        uncleanedCounts: null,
        unusedCounts: null,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    async onLoad(options) {
        let grade = wx.getStorageSync('grade')
        this.setData({
            grade: grade,
        })
        let clubNames = []
        let cnNames = []
        let emails = []
        let teachers = []
        let classes = []
        let ids = []
        let statuses = []
        let uncleanedCounts = {}
        let unusedCounts = {}
        // load in all club accounts
        const db = wx.cloud.database();
        let res = await db.collection("clubs").where({
            status: {$ne: -1},
            $or: [{class: {'$regex':grade[0]+'-'}}, {class: {'$regex':grade[1]+'-'}}]
        })
        .get()
        let list = res.data;
        console.log("club list", list)
        let that = this
        list.forEach(function (item, index) {
            clubNames[index] = item.clubName;
            cnNames[index] = item.leaderName;
            emails[index] = item.email;
            teachers[index] = item.teacherName;
            classes[index] = item.class;
            ids[index] = item._id;
            statuses[index] = item.status;
            db.collection("reservations").where({
                user: item.clubName,
                // status: 2 // TODO: uncomment, only check event that has ended
            })
            .get({
                success(res) {
                    let uncleanedCount = 0
                    let unusedCount = 0
                    for (let i = 0; i < res.data.length; i++) {
                        console.log( res.data[i].cleaned,  res.data[i].used, item.clubName) 
                        if (res.data[i].cleaned == false){
                            uncleanedCount ++
                        }
                        if (res.data[i].used == false){
                            unusedCount ++
                        }
                    }
                    uncleanedCounts[item.clubName] = uncleanedCount
                    unusedCounts[item.clubName] = unusedCount
                    if (Object.keys(uncleanedCounts).length == list.length && Object.keys(unusedCounts).length == list.length) {
                        that.setData({
                            uncleanedCounts: uncleanedCounts,
                            unusedCounts: unusedCounts,
                        })
                    }
                }
            })
        })
        this.setData({
            clubNames: clubNames,
            cnNames: cnNames,
            emails: emails,
            teachers: teachers,
            classes: classes,
            ids: ids,
            statuses: statuses
        })
    },

    onBindSuspend(e) {
        let idx = e.currentTarget.dataset.index;
        let id = this.data.ids[idx];
        wx.setStorageSync('id', id)
        // navigate to provide reasons
        wx.navigateTo({
            url: "./suspendReason",
            success(res) {
                console.log("success");
            },
            fail(res) {
                console.log("failed");
            }
        })
    },

    onBindUnsuspend(e) {
        const db = wx.cloud.database();
        let idx = e.currentTarget.dataset.index;
        let id = this.data.ids[idx];
        let that = this;
        db.collection("clubs")
        .doc(id)
        .update({
            data: ({
                status: 1,
            })
        })
        .then(res => {
            console.log("Unsuspended", res);
            that.onLoad();
        })
    },
})