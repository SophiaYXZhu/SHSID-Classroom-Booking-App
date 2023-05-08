// pages/gradeTeacher/suspendReason.js


Page({
    /**
     * 页面的初始数据
     */
    data: {
        reasonsList: ["Inauthentic account information", "Past disciplinary action conducted by the club", "Other"],
        reason: "",
        reasonIdx: 0,
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        
    },

    onBindInfo(e) {
        let reasonsList = this.data.reasonsList
        this.setData({
            reasonIdx: 0,
            reason: reasonsList[0]
        })
    },

    onBindDisciplinary(e) {
        let reasonsList = this.data.reasonsList
        this.setData({
            reasonIdx: 1,
            reason: reasonsList[1]
        })
    },

    onBindOther(e) {
        this.setData({
            reasonIdx: 2
        })
    },

    bindInputReason(e) {
        const val = e.detail.value;
        this.setData({
            reason: val,
        })
    },

    onBindSubmit(e) {
        const db = wx.cloud.database();
        let id = wx.getStorageSync('id')
        let reason = ""
        if (this.data.reason != "") {
            reason = this.data.reason;
            db.collection("clubs").
            doc(id).update({
                data: {
                    status: 0, // 0 stands for suspended or disapproved
                    suspendReason: reason,
                }
            }).then(res => {
                console.log("suspend success", res);
            }).catch(e => {
                console.log("suspend failed", e);
            })
            wx.showModal({
                title: 'Success',
                content: 'Your reason has been uploaded.',
                showCancel: false,
                success (res) {
                    wx.navigateBack({
                        delta: 1,
                        success: function (e) {
                            var page = getCurrentPages().pop();
                            if (page == undefined || page == null) return;
                            page.onLoad();
                        }
                    })
                }
            });
        }
        else {
            wx.showModal({
                title: 'Warning',
                content: 'You have not selected/entered a reason.',
            });
        }
    },

    onPullDownRefresh() {
        this.onLoad();
    }

})
