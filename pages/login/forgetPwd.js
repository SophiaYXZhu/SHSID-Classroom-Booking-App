// pages/login/forgetPwd.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        cnName: "",
        clubName: "",
        email: "",
        teacherName: "",
        leaderClass: ""
    },

    onLoad(options) {

    },

    bindInputClubName(e) {
      const val = e.detail.value;
      this.setData({
          clubName: val,
      })
    },

    bindInputCnName(e) {
        const val = e.detail.value;
        this.setData({
            cnName: val,
        })
    },

    bindInputEmail(e) {
        const val = e.detail.value;
        this.setData({
            email: val,
        })
    },

    bindInputTeacherName(e) {
        const val = e.detail.value;
        this.setData({
            teacherName: val,
        })
    },

    bindInputClass(e) {
        const val = e.detail.value;
        this.setData({
            leaderClass: val,
        })
    },

    bindValidate(e) {
        let clubName = this.data.clubName
        let cnName = this.data.cnName
        let Class = this.data.leaderClass
        let email = this.data.email
        let teacher = this.data.teacherName
        // check if the above information is in database of clubs
        wx.cloud.database().collection("clubs").where({
            clubName: clubName,
            leaderName: cnName,
            class: Class,
            email: email,
            teacherName: teacher
        })
        .get()
        .then(res => {
            let list = res.data;
            if (list.length > 0) {
                wx.showModal({
                    title: 'Validation Success',
                    content: 'Validation Success.',
                    showCancel: false,
                    success(res) {
                        wx.navigateTo({
                            url: "./pwdReset",
                            success: function(res) {
                                console.log("validate success");
                            }
                        })
                    }
                });
            }
            else {
                wx.showModal({
                    title: 'Validation Failed',
                    content: 'Validation Failed. Please check if you have entered all fields correctly.',
                showCancel: false,
                });
            }
        })
    }
})