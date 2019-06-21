# React后台管理项目
##1.git 管理
* 创建本地仓库
    *通过create-react-app创建，会自动生成本地仓库（git init）
    *本地版本控制
        *删除多余文件
        *添加了.idea的忽略
        *git add .
        *git commit -m 'xxx'
*创建远程仓库
    *上github创建仓库
*本地仓库的内容提交到远程仓库中去
    *git remote add origin xxx关联仓库
    *git push -u（首次）origin master/dev
*本地分支操作
    *git checkout -b dev 新建并切换到dev分支
    *git checkout master 切换master分支
    *git merge dev 合并dev分支的内容