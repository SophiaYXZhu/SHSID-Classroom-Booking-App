// 调用 saveAsCSV 云函数，在学期结束时save database("reservations") as csv

wx.cloud.callFunction({
    name:"saveAsCSV",
    data:{
        arropenid: arropenid
    },
    complete:res=>{
        wx.cloud.getTempFileURL({ //获取文件下载地址（24小时内有效）
            fileList:[res.result.fileID],
            success:res=>{
                this.setData({
                    tempFileURL:res.fileList[0].tempFileURL,
                    showUrl:true
                })
                wx.setClipboardData({   //复制刚获取到链接，成功后会自动弹窗提示已复制
                    data:this.data.tempFileURL,
                    success (res) {
                        wx.getClipboardData({
                            success (res) {
                                console.log(res.data) // data
                            }
                        })
                    }
                })
            }
        })
    }
})
