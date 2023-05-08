// pages/teacher/activate.js
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
        ids: []
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
        // load in all club accounts
        const db = wx.cloud.database();
        await db.collection("clubs").where({
            status: -1,
            $or: [{class: {'$regex':grade[0]+'-'}}, {class: {'$regex':grade[1]+'-'}}] //TODO
        })
        .get()
        .then(res => {
            let list = res.data;
            console.log(list, "club list")
            list.forEach(function (item, index) {
                clubNames[index] = item.clubName;
                cnNames[index] = item.leaderName;
                emails[index] = item.email;
                teachers[index] = item.teacherName;
                classes[index] = item.class;
                ids[index] = item._id;
            })
            this.setData({
                clubNames: clubNames,
                cnNames: cnNames,
                emails: emails,
                teachers: teachers,
                classes: classes,
                ids: ids,
            })
        })
        .catch(err => {
            console.log("load data fail", err)
        })
    },

    onBindActivate(e) {
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
            console.log("Activate success", res);
            that.onLoad();
        })
    },

    onBindDisapprove(e) {
        const db = wx.cloud.database();
        let idx = e.currentTarget.dataset.index;
        let id = this.data.ids[idx];
        let that = this;
        db.collection("clubs")
        .doc(id)
        .update({
            data: ({
                status: 0,
            })
        })
        .then(res => {
            console.log("Disapproved", res);
            that.onLoad();
        })
    },
})