import React from 'react'
import {
  Input, InputNumber, Select, DatePicker, Checkbox,
  Radio, Switch, Slider, Button, Table, List, Card,
  Tag, Badge, Avatar, Alert, Progress, Spin, Divider, Typography
} from 'antd'

const { Title, Text } = Typography

function renderComponent(type, props) {
  const p = { ...props }
  delete p.children
  switch (type) {
    case 'Input': return <Input {...p} />
    case 'Input.Password': return <Input.Password {...p} />
    case 'Input.TextArea': return <Input.TextArea {...p} />
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
    case 'Tag': return <Tag {...p}>{props.children}</Tag>
    case 'Badge': return <Badge {...p}><Avatar shape="square">예시</Avatar></Badge>
    case 'Avatar': return <Avatar {...p}>U</Avatar>
    case 'Alert': return <Alert {...p} />
    case 'Progress': return <Progress {...p} />
    case 'Spin': return <div style={{ display: 'flex', justifyContent: 'center', padding: 4 }}><Spin {...p} /></div>
    case 'Divider': return <Divider {...p} />
    case 'Typography.Title': return <Title {...p}>{props.children}</Title>
    case 'Typography.Text': return <Text {...p}>{props.children}</Text>
    default: return <div style={{ color: '#666', fontSize: 11 }}>{type}</div>
  }
}

export default function NestedCanvasItem({ item, onRemove }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#1c1c1c',
      border: '1px solid #333',
      borderRadius: 4,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      padding: '18px 8px 6px',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: 6,
        fontSize: 9, color: '#444', pointerEvents: 'none', userSelect: 'none',
      }}>
        {item.type}
      </div>
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onRemove() }}
        style={{
          position: 'absolute', top: 0, right: 0,
          width: 24, height: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 10, color: '#555', zIndex: 100,
          borderRadius: '0 4px 0 4px',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#ff4d4f'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#555' }}
      >
        ✕
      </div>
      <div style={{ width: '100%', pointerEvents: 'none' }}>
        {renderComponent(item.type, item.props)}
      </div>
    </div>
  )
}