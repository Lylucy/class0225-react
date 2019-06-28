import React, { Component } from 'react';
import { Card, Icon, Form, Input, Button, Cascader, InputNumber } from 'antd';
import draftToHtml from "draftjs-to-html";
import {convertToRaw} from "draft-js";

import { reqCategories,reqAddProduct, reqUpdateProduct } from "../../../api";
import RichTextEditor from './rich-text-editor';

import PictureWall from './picture-wall';
import './index.less';

const { Item } = Form;

class SaveUpdate extends Component{
  state = {
    options:[]
  };

  /*
  ref获取普通标签，就是拿到真实的DOM元素
  获取组件，是就拿到组件的实例对象
   */

  richTextEditorRef = React.createRef();

  getCategories = async (parentId) => {
    const result = await reqCategories(parentId);

    if (result) {
      //判断如果是二级分类
      if (parentId === '0') {
        this.setState({
          options:result.map((item) => {
            return {
              value: item._id,
              label: item.name,
              isLeaf: false,
          }
        })
      })
    } else {
        this.setState({
          options: this.state.options.map((item) => {
            if (item.value === parentId) {
              item.children = result.map((item) => {
                return {
                  value: item._id,
                  label: item.name
                }
              })
            }
            return item;
          })
        })
      }
    }
  }
  async componentDidMount() {
    this.getCategories('0');
    /*
    如果是一级分类：pCategoryId: 0 categoryId: 一级分类id
    如果是二级分类：PCategoryId: 一级分类id categoryId：二级分类id
     */
    const product = this.props.location.state;
    let categoriesId = [];
    if (product) {
      if (product.pCategoryId !== '0') {
        categoriesId.push(product.pCategoryId);
        //请求二级分类数据
        this.getCategories(product.pCategoryId);
      }
      categoriesId.push(product.categoryId);
    }
    this.categoriesId = categoriesId;
  };

}

  /**
   * \加载二级分类数据
   *
   */
  loadData = async selectedOptions => {
    //获取数组最后一项
    const targetOption = selectedOptions[selectedOptions.length - 1];
    //显示loading图标
    targetOption.loading = true;
    //发送请求，请求二级分类数据
    const result = await reqCategories(targetOption.value);

    if (result) {
      //将loading改成false
      targetOption.logding = false;
      targetOption.children = result.map((item) => {
        return {
          label: item.name,
          value: item._id,
        }
      });
      //更新状态
      this.setState({
        options: [...this.state.options],
      });
    }

  };
  addProduct = (e) => {
    e.preventDefault();
    //验证表单和收集数据
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const { editorState } = this.richTextEditorRef.current.state;
        const detail = draftToHtml(convertToRaw(editorState.getCurrentContent()));
        const { name, desc, price, categoriesId } = values;

        let pCategoryId = '0';
        let categoryId = '';
        
      }
    })

  };

  render() {
    const { options } = this.state;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24},
        sm: { span: 2},
      },
      wrapperCol: {
        xs: { span: 24},
        sm: { span: 10},
      },
    };

    return <Card title={<div className="product-title"><Icon type="arrow-left" className='arrow-icon'/><span>添加商品</span></div>}>
    <Form {...formItemLayout} onSubmit={this.addProduct}>
      <Item label="商品名称">
        <Input placeholder="请输入商品描述 "/>
      </Item>
      <Item label="商品描述">
        <Input placeholder="请输入商品描述"/>
      </Item>
      <Item label="选择分类" wrapperCol={{span: 5}}>
        <Cascader
          options={options}
          loadData={this.loadData}
          changeOnSelect
        />
      </Item>
      <Item lable="商品价格">
        <InputNumber
          // 格式化，对输入的数据进行格式化
          formatter={value => `￥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/￥\s?|(,*)/g, '')}
          className="input-number"
        />
      </Item>
      <Item label="商品详情" wrapperCol={{span: 20}}>
        <RichTextEditor />
      </Item>
      <Item>
        <Button type="primary" className="add-product-btn" htmlType="submit">提交</Button>
      </Item>
    </Form>
    </Card>;
  }
}