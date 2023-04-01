import { useContext } from 'react'
import CheckScopeIITable from '@/pages/Check/ScopeII/CheckScopeIITable'
import { Button } from 'antd'
import { AppstoreAddOutlined } from '@ant-design/icons'
import { ProjectContext } from '@/pages/Check'
import { TGroupData } from '@/types'
import { nanoid } from 'nanoid'
import { companyCategories } from '@/utils'

const ScopeIIPage = () => {
  const { projectData, scopes, setScopes } = useContext(ProjectContext)
  const postId = projectData?.id
  const scopeIIGroups: TGroupData[] = scopes?.scopeII || []

  const groupName =
    companyCategories.find(
      (companyCategory) =>
        companyCategory.name === scopes?.info?.companyCategory,
    )?.scopeIDefaultValue || '辦公室'

  const handleAddGroup = () => {
    setScopes({
      ...scopes,
      scopeII: [
        ...scopeIIGroups,
        {
          groupKey: nanoid(),
          groupName,
          dataSource: [],
        },
      ],
    })
  }

  const handleDeleteGroup = (theGroupKey: string) => {
    const newScopeIIGroups = scopeIIGroups.filter(
      (theGroup) => theGroup?.groupKey !== theGroupKey,
    )
    setScopes({
      ...scopes,
      scopeII: [
        ...newScopeIIGroups,
      ],
    })
  }

  return (
    <>
      {scopeIIGroups.map((theGroup, index) => {
        const key = theGroup?.groupKey || nanoid()
        return (
          <CheckScopeIITable
            key={key}
            groupKey={key}
            groupIndex={index}
            groupData={theGroup}
            postId={postId}
            onDelete={handleDeleteGroup}
          />
        )
      })}
      <Button
        className="w-full mt-8"
        type="primary"
        size="large"
        onClick={handleAddGroup}
      >
        <AppstoreAddOutlined className="mr-2" />
        新增群組
      </Button>
    </>
  )
}

export default ScopeIIPage
