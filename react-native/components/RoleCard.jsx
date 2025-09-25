import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import Icon from '../Icon';

const RoleCard = ({title, icon, selected, onPress}) => {
    const color = (title=='Farmer')?'green':(title=='Vendor')?'orange':'blue';
  return (
    <TouchableOpacity style={{ borderWidth: selected ? 3 : 1, borderColor: selected ? color : 'grey', borderRadius: 5, flex: 1, alignItems: 'center', height: 80, justifyContent: 'center', marginTop: 5}} onPress={onPress}>
        <Icon name={icon} color={selected ? color : 'grey'} size={24} />
        <Text style={{ fontSize: 16, color: selected ? color : 'grey' }}>{title}</Text>
    </TouchableOpacity>
  )
}

export default RoleCard