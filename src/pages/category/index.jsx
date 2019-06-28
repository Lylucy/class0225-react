import React, { Component } from 'react';
import { Card, Button, Icon, Table, Modal, message } from 'antd';

import { reqCategories, reqAddCategory, reqUpdateCategoryName  } from '../../api';
import MyButton from '../../components/my-button';
import AddCategoryForm from './add-category-form';
import UpdateCategoryNameForm from './update-category-name';
import './index.less';

export default class Category extends Component{
  state = {
    categories: [],//一级分类列表
    subCategories: [],//二级分类列表
    isShowSubCategories: false, //是否显示二级分类列表
    isShowAddCategory: false, // 显示添加品类
    isShowUpdateCategoryName: false, // 显示修改分类名称
    loading: true, //是否显示loading
  };
//初始化临时保存分类数据（否则下面this.category.name会报错）
  category = {};

   componentDidMount(){
   this.fetchCategories('0');
  };

  /**
   * 请求分类数据函数
   */
  fetchCategories = async (parentId) => {
    this.setState({
      loading: true
    });
    const result = await reqCategories(parentId);

    if (result) {
      if (parentId === '0') {
        this.setState({categories:result});
      } else {
        this.setState({
          isShowSubCategories: true
        })
      }
    }

    this.setState({
      logding: false
    })

  };


  /**
   * 添加品类
   */


  addCategory = () => {
    // 1. 表单校验
    // 2. 收集表单数据
    // console.log(this.addCategoryForm);
    const { form } =this.addCategoryForm.props;

    form.validateFields(async (err, values) => {
      if (!err) {
        //校验通过
        console.log(values);
        const { parentId, categoryName } = values;
        //3.发送请求
        const result = await reqAddCategory(parentId, categoryName);
        if (result) {
          //添加分类成功
          message.success('添加分类成功', 2);
          //清空表单数据
          form.resetFields(['parentId', 'categoryName']);

          const options = {
            isShowAddCategory:false
          };

          const { isShowSubCategories } = this.state;

          if (result.parentId === '0') {
            options.categories = [...this.state.categories, result];

          }else if (isShowSubCategories && result.parentId === this.parentCategory._id) {
            options.subCategories = [...this.state.subCategories,result];
          }
          //统一更新
          this.setState(options);
        }
      }
    })
  };

  /**
   * 切换显示
   * @returns {*}
   */
  toggleDisplay = (stateName, stateValue) => {
    return () => {
      this.setState({
        [stateName]:stateValue
      })
    }
  };

  hideUpdateCategoryName = () => {
    //清空表单项的值
    this.hideUpdateCategoryNameForm.props.form.resetFields(['categoryName']);
    //隐藏对话框
    this.setState({
      isShowUpdateCategoryName: false
    })
  };

  saveCategory = (category) => {
    return () => {
      //保存更新的分类数据
      this.category = category;
      this.setState({
        isShowUpdateCategoryName:true
      })
    }
  };
  /**
   * 更新分类名称
   */
  updateCategoryName = () => {
    const { form } = this.updateCategoryNameForm.props;
    //校验表单，收集数据
    form.validateFields(async (err, values) => {
      if (!err) {
        const { categoryName } = values;
        const categoryId = this.category._id;
        //发送请求
        const result = await reqUpdateCategoryName(categoryId,categoryName)
;
        if (result) {
          const { parentId } = this.category;

          let categoryDate = this.state.categories;
          let stateName = 'categories';

          if (parentId !=='0') {
            //二级分类
            categoryDate = this.state.subCategories;
            stateName = 'subCategories';
          }


          //不想修改源数据
          const categories = this.state.categories.map((category) => {
            let { _id, name,parentId } = category;
            //找到对应id的category，修改分类名称
            if (_id === categoryId) {
              name = categoryName;
              return {
                _id,
                name,
                parentId
              }
            }
            //没有修改的数据直接返回
            return category
          });

          //清空表单项的值 隐藏对话框
          form.resetFields(['categoryName']);
          message.success('更新分类名称成功',2 );

          this.setState({
            isShowUpdateCategoryName:false,
            categories
          })
        }
      }
    })
  };






  showSubCategory = (category) => {
    return async () => {
      //请求二级分类数据
      this.parentCateGory = category;
      this.fetchCategories(category._id);
    }

  };

  /**
   * 返回一级分类
   * @returns {*}
   */

  goBack = () => {
    this.setState({
      isShowSubCategories: false
    })
  };

  render() {
    const { categories, subCategories, isShowSubCategories, isShowAddCategory, isShowUpdateCategoryName, loading } = this.state;

    // 决定表头内容
    const columns = [
      {
        title: '品类名称',
        dataIndex: 'name',
      },
      {
        title: '操作',
        // dataIndex: '_id',
        className: 'category-operation',
        // 改变当列的显示
        render: category => {
          // console.log(category);
          return <div>
            <MyButton onClick={this.saveCategory(category)}>修改名称</MyButton>
            {
              this.state.isShowSubCategories ? null : <MyButton onClick={this.showSubCategory(category)}>查看其子品类</MyButton>
            }

          </div>
        },
      },
    ];
    // 决定表格里面数据
    /*const data = [
      {
        key: '1',
        name: '手机',
        // operation: 'xxxxx',
      },
      {
        key: '2',
        categoryName: '电脑',
        // operation: 'yyyy',
      },
      {
        key: '3',
        categoryName: '耳机',
        // operation: 'zzzzzz',
      },
      {
        key: '4',
        categoryName: '鼠标',
        // operation: 'zzzzzz',
      },
    ];*/

    return <Card title="一级分类列表" extra={<Button type="primary" onClick={this.toggleDisplay('isShowAddCategory', true)}><Icon type="plus" />添加品类</Button>}>
      <Table
        columns={columns}
        dataSource={categories}
        bordered
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: ['3', '6', '9', '12'],
          defaultPageSize: 3,
          showQuickJumper: true
        }}
        rowKey="_id"
      />

      <Modal
        title="添加分类"
        visible={isShowAddCategory}
        onOk={this.addCategory}
        onCancel={this.toggleDisplay('isShowAddCategory', false)}
        okText="确认"
        cancelText="取消"
      >
        <AddCategoryForm categories={categories} wrappedComponentRef={(form) => this.addCategoryForm = form}/>
      </Modal>

      <Modal
        title="修改分类名称"
        visible={isShowUpdateCategoryName}
        onOk={this.updateCategoryName}
        onCancel={this.hideUpdateCategoryName}
        okText="确认"
        cancelText="取消"
        width={250}
      >
        <UpdateCategoryNameForm categoryName={this.category.name} wrappedComponentRef={(form) => this.updateCategoryNameForm = form}/>
      </Modal>

    </Card>;
  }
}
