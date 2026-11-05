import React from 'react'
import {
  Input, InputNumber, Select, DatePicker, Checkbox,
  Radio, Switch, Slider, Button, Table, List, Card,
  Tag, Badge, Avatar, Alert, Progress, Spin, Divider, Typography
} from 'antd'

const { Title, Text } = Typography

export default function renderComponent(type, props) {
  const p = { ...props }
  delete p.children
  switch (type) {
    case 'Input': return <Input {...p} />
    case 'Input.Password': return <Input.Password {...p} />
    case 'Input.TextArea': return <Input.TextArea {...p} rows={null} style={{ width: '100%', height: '100%', resize: 'none', minHeight: 'unset' }} />
    case 'InputNumber': return <InputNumber style={{ width: '100%' }} {...p} />
    case 'Select': return <Select style={{ width: '100%' }} {...p} />
    case 'DatePicker': return <DatePicker style={{ width: '100%' }} {...p} />
    case 'Checkbox': return <Checkbox {...p}>{props.children}</Checkbox>
    case 'Radio.Group': return <Radio.Group {...p} />
    case 'Switch': return <Switch {...p} />
    case 'Slider': return <Slider {...p} />
    case 'Button': return <Button type="primary" {...p}>{props.children}</Button>
    case 'Button.Default': return <Button {...p}>{props.children}</Button>
    case 'Button.Danger': return <Button danger {...p}>{props.children}</Button>
    // Table/List/Card는 아이템 높이를 채우고, 넘치는 내용은 안에서 스크롤
    case 'Table': return (
      <div style={{ height: '100%', overflow: 'auto' }}>
        <Table size="small"
          dataSource={[{ key: 1, name: '홍길동', age: 30 }, { key: 2, name: '김철수', age: 25 }]}
          columns={[{ title: '이름', dataIndex: 'name' }, { title: '나이', dataIndex: 'age' }]}
          pagination={false} {...p} />
      </div>
    )
    case 'List': return (
      <div style={{ height: '100%', overflow: 'auto' }}>
        <List size="small" dataSource={['항목 1', '항목 2', '항목 3']}
          renderItem={item => <List.Item>{item}</List.Item>} {...p} />
      </div>
    )
    case 'Card': return (
      <Card size="small" {...p}
        style={{ height: '100%', display: 'flex', flexDirection: 'column', ...p.style }}
        styles={{ body: { flex: 1, minHeight: 0, overflow: 'auto' } }}>
        <Text type="secondary">카드 내용</Text>
      </Card>
    )
    case 'Tag': return <Tag {...p}>{props.children}</Tag>
    case 'Badge': return <Badge {...p}><Avatar shape="square">예시</Avatar></Badge>
    case 'Avatar': return <Avatar {...p}>U</Avatar>
    case 'Alert': return <Alert {...p} />
    case 'Progress': return <Progress {...p} />
    case 'Spin': return <div style={{ display: 'flex', justifyContent: 'center', padding: 8 }}><Spin {...p} /></div>
    case 'Divider': return <Divider {...p} />
    case 'Typography.Title': return <Title {...p}>{props.children}</Title>
    case 'Typography.Text': return <Text {...p}>{props.children}</Text>
    default: return <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>{type}</div>
  }
}
