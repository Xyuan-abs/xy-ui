<!-- 
  名称：表单
 -->
<script setup>
import XyText from './text/index.vue'
import XyInput from './input/index.vue'
import XySelect from './select/index.vue'
import XyCheckbox from './checkbox/index.vue'
import XyRadio from './radio/index.vue'
import XyCascader from './cascader/index.vue'
import XyTreeSelect from './tree-select/index.vue'
import XyFileList from './file-list/index.vue'
import XySingleImgUpload from './single-img-upload/index.vue'
import XyInputNumberWithUnit from './input-number-with-unit/index.vue'
import XyInputPassword from './input-password/index.vue'

import useSetRules from '../composables/useSetRules'
import useSetPlaceholder from '../composables/useSetPlaceholder'
import useSubmit from '../composables/useSubmit'
import useSetFormValue from '../composables/useSetFormValue'
import useFormItemLink from '../composables/useFormItemLink'

import { ELEMENT } from '../composables/useElement'

/**
 * @example
 * formItem:{
 *   name: 'input', // 表单项 name,提交表单生成对象的key
 *   label: '标题', // 表单项label
 *   value: '12121', // 表单项的值
 *   valueMap:[],// value为数组时的 value格式化  value:[1,2],valueMap:['a','b'] -> { a:1,b:2}
 *   valueFmt:(value)=>({a:value}),// 在提交时 格式化value
 *   element: ELEMENT.INPUT, // 表单项类型
 *   hidden:false, // 是否隐藏 v-if
 *   isShow:true, // 是否隐藏 v-show
 *   ignoreOnSave:false, // 是否在提交时忽略当前字段
 *   options:[], // 选项
 *   attrs:{}, // element组件 attrs
 *   componentProps:{},  // 自定义组件属性，详细配置看各组件注释
 *   cols:3, // 表单项占的列数  cols:'max'->占一整行
 *   hiddenLabel:false, // 不展示label
 *   rules:[],// 校验规则
 *   required:false,// 是否必填
 *   tip:'', // 表单项提示
 *   onSetValue:(data,formItem)=>{},// 回显数据时触发
 * }
 *
 */

const props = defineProps({
  dynamicForm: {
    type: Object,
    default: () => ({
      form: [
        {
          name: 'input',
          label: '标题',
          value: '12121',
          element: ELEMENT.INPUT,
        },
        {
          name: 'select',
          label: '标题',
          element: ELEMENT.SELECT,
          value: null,
          options: [
            {
              label: '标题',
              value: 'input',
            },
          ],
        },
      ],
    }),
  },
  labelWidth: { type: Number, default: 70 },
  cols: {
    type: Number,
    default: 1,
  },
})
const dynamicFormRef = ref(null)
const emit = defineEmits(['submit', 'reset', 'change'])

const colStyle = computed(() => ({
  display: 'grid',
  'grid-template-columns': `repeat(${props.cols},1fr)`,
  'column-gap': '10px',
}))

const { setRules } = useSetRules()
const { getPlaceholder } = useSetPlaceholder()
const { setFormItemValue, setFormValue } = useSetFormValue(props.dynamicForm)

const { getSaveData, validateForm, validateField, toSaveData, submitForm, resetFields, resetForm, clearValidate } =
  useSubmit(dynamicFormRef, props.dynamicForm, emit)

useFormItemLink(props.dynamicForm, clearValidate)

/**
 * 重写表单事件
 * @param {*} formItem
 * @param {*} index
 */
function overwriteEvents(formItem, index) {
  let events = { ...formItem.events }

  // 默认拥有 change 事件
  if (!events || events.change === void 0) {
    events = { change: () => {} }
  }

  Object.keys(events).forEach((key) => {
    const oldEvent = events[key]
    events[key] = (...args) => {
      oldEvent(formItem, index, ...args)

      if (key === 'change') {
        validateField(`form[${index}].value`)
        emit('change', formItem, index)
      }
    }
  })
  return events
}

// 暴露出去的 属性和方法
defineExpose({
  dynamicFormRef,
  setFormItemValue,
  setFormValue,
  getSaveData,
  validateField,
  validateForm,
  toSaveData,
  submitForm,
  resetFields,
  resetForm,
  clearValidate,
})
</script>

<template>
  <div class="xy-form">
    <el-form
      ref="dynamicFormRef"
      v-bind="$attrs"
      :label-width="labelWidth + 'px'"
      :model="dynamicForm"
      :style="{
        ...colStyle,
      }"
      @submit.prevent
    >
      <template v-for="(formItem, index) in dynamicForm.form">
        <el-form-item
          v-if="!formItem.hidden"
          v-show="formItem.isShow !== false"
          :key="'formItem' + index"
          :label="formItem.hiddenLabel ? '' : `${formItem.label}${formItem.label ? '：' : ''}`"
          :label-width="formItem.hiddenLabel ? '0px' : labelWidth + 'px'"
          :prop="'form[' + index + '].value'"
          :required="formItem.required"
          :rules="setRules(formItem)"
          :style="{
            ...formItem.style,
            ...(formItem.cols
              ? {
                  'grid-column-start': `span ${formItem.cols === 'max' ? cols : formItem.cols}`,
                }
              : {}),
          }"
        >
          <!-- slot -->
          <slot
            v-if="formItem.element === ELEMENT.SLOT"
            :form-item="formItem"
            :index="index"
            :name="formItem.name"
          ></slot>

          <!-- text -->
          <xy-text v-else-if="formItem.element === ELEMENT.TEXT" :form-item="formItem" />

          <!-- input -->
          <xy-input
            v-else-if="formItem.element === ELEMENT.INPUT"
            v-model="formItem.value"
            :form-item="formItem"
            :placeholder="getPlaceholder(formItem)"
            v-bind="formItem.attrs"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- password -->
          <xy-input-password
            v-else-if="formItem.element === ELEMENT.PASSWORD"
            v-model="formItem.value"
            :placeholder="getPlaceholder(formItem)"
            v-bind="formItem.attrs"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- select -->
          <xy-select
            v-else-if="formItem.element === ELEMENT.SELECT"
            v-model:model-value="formItem.value"
            :form-item="formItem"
            :placeholder="getPlaceholder(formItem)"
            v-bind="formItem.attrs"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- cascader -->
          <xy-cascader
            v-else-if="formItem.element === ELEMENT.CASCADER"
            v-model:model-value="formItem.value"
            :form-item="formItem"
            :placeholder="getPlaceholder(formItem)"
            v-bind="formItem.attrs"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- tree-select -->
          <xy-tree-select
            v-else-if="formItem.element === ELEMENT.TREE_SELECT"
            v-model:model-value="formItem.value"
            :form-item="formItem"
            :placeholder="getPlaceholder(formItem)"
            v-bind="formItem.attrs"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- date-picker -->
          <el-date-picker
            v-else-if="formItem.element === ELEMENT.DATE_PICKER"
            v-model="formItem.value"
            clearable
            end-placeholder="终止日期"
            :placeholder="getPlaceholder(formItem)"
            start-placeholder="起始日期"
            type="date"
            v-bind="formItem.attrs"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- 带单位的input-number -->
          <xy-input-number-with-unit
            v-else-if="formItem.element === ELEMENT.NUMBER_WITH_UNIT"
            v-model:model-value="formItem.value"
            :form-item="formItem"
            :index="index"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- checkbox -->
          <xy-checkbox
            v-else-if="formItem.element === ELEMENT.CHECKBOX"
            v-model:model-value="formItem.value"
            :form-item="formItem"
            v-bind="formItem.attrs"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- radio -->
          <xy-radio
            v-else-if="formItem.element === ELEMENT.RADIO"
            v-model:model-value="formItem.value"
            :form-item="formItem"
            v-bind="formItem.attrs"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- fileList -->
          <template v-else-if="formItem.element === ELEMENT.FILE_LIST">
            <xy-file-list
              v-model:model-value="formItem.value"
              :form-item="formItem"
              v-bind="formItem.attrs"
              v-on="overwriteEvents(formItem, index)"
            />
          </template>

          <!-- 单图片上传 -->
          <xy-single-img-upload
            v-else-if="formItem.element === ELEMENT.SINGLE_IMG_UPLOAD"
            v-model="formItem.value"
            v-bind="formItem.attrs"
            :form-item="formItem"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- switch -->
          <el-switch
            v-else-if="formItem.element === ELEMENT.SWITCH"
            v-model="formItem.value"
            v-bind="formItem.attrs"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- rate -->
          <el-rate
            v-else-if="formItem.element === ELEMENT.RATE"
            v-model="formItem.value"
            v-bind="formItem.attrs"
            v-on="overwriteEvents(formItem, index)"
          />

          <!-- 提示 -->
          <div v-if="formItem.tip" class="form-item-tip">{{ formItem.tip }}</div>
        </el-form-item>
      </template>
    </el-form>
  </div>
</template>
<style lang="scss" scoped>
.xy-form {
  width: 100%;
  :deep(.el-form) {
    & > .el-form-item {
      flex-grow: 0;
      flex-shrink: 0;
      width: 100%;
      .el-input,
      .el-select,
      .el-cascader,
      .el-date-editor {
        width: 100%;
        // max-width: 400px;
        .el-input__wrapper {
          width: 100%;
        }
      }

      &:last-child {
        // margin-bottom: 0;
      }
      &.is-error {
        .el-select .el-input__wrapper,
        .el-input__wrapper {
          box-shadow: 0 0 0 1px var(--el-color-danger) xyet;
        }
      }
      .el-form-item {
        margin-bottom: 18px;
      }
      .form-item-tip {
        margin-top: 5px;
        font-size: 12px;
        line-height: 1.5;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>
