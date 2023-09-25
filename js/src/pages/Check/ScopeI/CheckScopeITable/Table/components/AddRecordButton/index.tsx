import { createContext, useContext, useState, useEffect } from 'react'
import { Button, Modal, Input, Radio, Form } from 'antd'
import { FolderAddFilled } from '@ant-design/icons'
import GWPYearlyFormItem from '@/pages/Check/ScopeI/CheckScopeITable/Table/components/GWPYearlyFormItem'
import GWPMonthlyFormItem from '@/pages/Check/ScopeI/CheckScopeITable/Table/components/GWPMonthlyFormItem'
import GWPHourlyFormItem from '@/pages/Check/ScopeI/CheckScopeITable/Table/components/GWPHourlyFormItem'
import type { TYearlyDataType } from '@/pages/Check/ScopeI/CheckScopeITable/Table/types'
import { nanoid } from 'nanoid'
import { gwpMapping, convertUnitToTons } from '@/utils'
import { ProjectContext } from '@/pages/Check'
import { TableDataContext } from '@/pages/Check/ScopeI/CheckScopeITable'
import { TScopes } from '@/types'
import { convertLanguage } from '@/utils/i18n'

export const FormContext = createContext<any | null>(null)
const AddRecordButton = () => {
  const form = Form.useFormInstance()
  const { scopes, setScopes, scopesNumber } = useContext(ProjectContext)
  const { groupIndex, groupKey } = useContext(TableDataContext)

  const scopeIGroups: TScopes = scopes[scopesNumber] || []
  const group = scopeIGroups.find(
    (theGroup: { groupKey: any }) => theGroup.groupKey === groupKey,
  )
  const dataSource = group?.dataSource || []

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false)

  const [
    validating,
    setValidating,
  ] = useState(false)

  const resetFormData = () => {
    form.resetFields([
      [
        scopesNumber,
        groupIndex,
        'sourceName',
      ],
      [
        scopesNumber,
        groupIndex,
        'period',
      ],
      [
        scopesNumber,
        groupIndex,
        'yearlyAmount',
      ],
      [
        scopesNumber,
        groupIndex,
        'monthlyAmount',
      ],
      [
        scopesNumber,
        groupIndex,
        'hourlyAmount',
      ],
      [
        scopesNumber,
        groupIndex,
        'hours',
      ],
      [
        scopesNumber,
        groupIndex,
        'gwp',
      ],
      [
        scopesNumber,
        groupIndex,
        'unit',
      ],
    ])
  }

  const showModal = () => {
    setIsModalOpen(true)
    resetFormData()
  }

  const handleData = () => {
    const formData = form.getFieldsValue()?.[scopesNumber][groupIndex]
    const getYearlyAmount = (theFormData: any) => {
      switch (theFormData?.period) {
        case 'yearly':
          return convertUnitToTons({
            value: theFormData.yearlyAmount ?? 0,
            unit: theFormData.unit,
          })
        case 'monthly':
          return convertUnitToTons({
            value: (theFormData?.monthlyAmount ?? []).reduce(
              (acc: number, cur: number) => acc + cur,
              0,
            ),
            unit: theFormData.unit,
          })
        case 'hourly':
          return convertUnitToTons({
            value: (theFormData.hourlyAmount ?? 0) * (theFormData.hours ?? 0),
            unit: theFormData.unit,
          })
        default:
          return 0
      }
    }
    const yearlyAmount = getYearlyAmount(formData)

    const ar5 = gwpMapping.find((gwp) => gwp?.value === formData?.gwp)?.ar5 || 0

    const carbonTonsPerYear = yearlyAmount * ar5

    const theFormatRecord: TYearlyDataType = {
      key: nanoid(),
      sourceName: formData?.sourceName,
      gwp: formData.gwp,
      yearlyAmount,
      ar5,
      co2e: carbonTonsPerYear,
      carbonTonsPerYear,
      period: formData?.period,
      monthlyAmount:
        formData?.period === 'monthly' ? formData.monthlyAmount : [],
      hourlyAmount: formData?.period === 'hourly' ? formData.hourlyAmount : 0,
      unit: formData.unit,
    }

    return [
      ...dataSource,
      theFormatRecord,
    ]
  }

  const handleModalOk = () => {
    setValidating(true)
    form
      .validateFields()
      .then((_values) => {
        setValidating(false)
        setIsModalOpen(false)
        const newDataSource = handleData()
        const newScopes = JSON.parse(JSON.stringify(scopes))

        if (newScopes && newScopes[scopesNumber]) {
          newScopes[scopesNumber][groupIndex].dataSource = newDataSource
        }

        setScopes(newScopes)
      })
      .catch((err) => {
        console.log('Validate Failed:', err)
      })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const period = Form.useWatch(
    [
      scopesNumber,
      groupIndex,
      'period',
    ],
    form,
  )

  return (
    <>
      <Button onClick={showModal} type="primary" className="mt-4">
        <FolderAddFilled className="mr-2" />
        {convertLanguage('新增設備')}
      </Button>
      <Modal
        title={convertLanguage('新增設備')}
        open={isModalOpen}
        onOk={handleModalOk}
        centered
        width={648}
        className="cc-modal"
        onCancel={handleCancel}
        okText={convertLanguage('新增設備')}
        cancelText={convertLanguage('取消')}
      >
        <div className="w-ful overflow-x-auto">
          <div className="min-w-[600px]">
            <Form
              form={form}
              onFieldsChange={() => {
                setValidating(false)
              }}
            >
              <Form.Item
                // hasFeedback={true}
                name={[
                  scopesNumber,
                  groupIndex,
                  'sourceName',
                ]}
                rules={[{ required: validating, message: '請輸入設備名稱' }]}
              >
                <Input className="mt-8" addonBefore="設備名稱" />
              </Form.Item>

              <Form.Item
                name={[
                  scopesNumber,
                  groupIndex,
                  'period',
                ]}
                initialValue="yearly"
              >
                <Radio.Group className="w-full mt-8" buttonStyle="solid">
                  <Radio.Button className="w-1/3 text-center" value="yearly">
                    年碳排放
                  </Radio.Button>
                  <Radio.Button className="w-1/3 text-center" value="monthly">
                    月碳排放
                  </Radio.Button>
                  <Radio.Button className="w-1/3 text-center" value="hourly">
                    每小時碳排放
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
              {period === 'yearly' && (
                <GWPYearlyFormItem
                  groupIndex={groupIndex}
                  validating={validating}
                  scopesNumber={scopesNumber}
                />
              )}
              {period === 'monthly' && (
                <GWPMonthlyFormItem
                  groupIndex={groupIndex}
                  validating={validating}
                  scopesNumber={scopesNumber}
                />
              )}
              {period === 'hourly' && (
                <GWPHourlyFormItem
                  groupIndex={groupIndex}
                  validating={validating}
                  scopesNumber={scopesNumber}
                />
              )}
            </Form>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default AddRecordButton
