import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminTable({ 
  data, 
  columns, 
  onRowPress,
  onEditPress,
  onDeletePress,
  style 
}) {
  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }
    return (
      <Text style={styles.cellText} numberOfLines={1}>
        {item[column.key]}
      </Text>
    );
  };

  const renderRow = (item, index) => (
    <TouchableOpacity
      key={index}
      style={styles.row}
      onPress={() => onRowPress && onRowPress(item)}
    >
      {columns.map((column, colIndex) => (
        <View key={colIndex} style={[styles.cell, { flex: column.flex || 1 }]}>
          {renderCell(item, column)}
        </View>
      ))}
      
      {(onEditPress || onDeletePress) && (
        <View style={styles.actionsCell}>
          {onEditPress && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEditPress(item)}
            >
              <Ionicons name="pencil-outline" size={16} color="#4CAF50" />
            </TouchableOpacity>
          )}
          {onDeletePress && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDeletePress(item)}
            >
              <Ionicons name="trash-outline" size={16} color="#FF6B6B" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        {columns.map((column, index) => (
          <View key={index} style={[styles.headerCell, { flex: column.flex || 1 }]}>
            <Text style={styles.headerText}>{column.title}</Text>
          </View>
        ))}
        {(onEditPress || onDeletePress) && (
          <View style={styles.actionsHeader}>
            <Text style={styles.headerText}>Actions</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {data.map((item, index) => renderRow(item, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerCell: {
    paddingRight: 8,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#283106',
  },
  actionsHeader: {
    width: 80,
    alignItems: 'center',
  },
  body: {
    maxHeight: 400,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cell: {
    paddingRight: 8,
  },
  cellText: {
    fontSize: 14,
    color: '#283106',
  },
  actionsCell: {
    flexDirection: 'row',
    width: 80,
    justifyContent: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
});




