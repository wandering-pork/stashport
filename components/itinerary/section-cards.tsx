'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, GripVertical, Edit2 } from 'lucide-react'
import { SectionItem, SectionItemData } from './section-item'
import { AddSectionModal } from './add-section-modal'
import { Button } from '@/components/ui/button'
import { SECTION_PRESETS, getSectionPreset, DEFAULT_SECTION_ICON } from '@/lib/constants/section-presets'
import { cn } from '@/lib/utils/cn'

export interface Section {
  name: string
  icon: string
  sortOrder: number
  items: SectionItemData[]
}

interface SectionCardsProps {
  sections: Section[]
  onSectionsChange: (sections: Section[]) => void
}

// Individual Section Card
function SectionCard({
  section,
  sectionIndex,
  totalSections,
  onUpdateSection,
  onRemoveSection,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: {
  section: Section
  sectionIndex: number
  totalSections: number
  onUpdateSection: (field: keyof Section, value: any) => void
  onRemoveSection: () => void
  onAddItem: () => void
  onUpdateItem: (itemIndex: number, field: keyof SectionItemData, value: string) => void
  onRemoveItem: (itemIndex: number) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedName, setEditedName] = useState(section.name)

  const preset = getSectionPreset(section.name)
  const placeholder = preset?.placeholder || 'Add places to this section'

  const handleSaveTitle = () => {
    if (editedName.trim()) {
      onUpdateSection('name', editedName.trim())
    } else {
      setEditedName(section.name)
    }
    setIsEditingTitle(false)
  }

  const isLast = sectionIndex === totalSections - 1

  return (
    <div className={cn('relative', !isLast && 'pb-8')}>
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[23px] top-14 bottom-0 w-1 bg-gradient-to-b from-secondary-300 via-secondary-200 to-transparent rounded-full" />
      )}

      <div className="flex items-start gap-4">
        {/* Section Icon Badge */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            'w-12 h-12 rounded-2xl flex items-center justify-center',
            'bg-gradient-to-br from-secondary-50 to-secondary-100',
            'border-2 border-secondary-200',
            'text-2xl',
            'shadow-md'
          )}>
            {section.icon}
          </div>
        </div>

        {/* Section Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              type="button"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-neutral-500" />
              )}
            </button>

            {/* Editable Section Title */}
            {isEditingTitle ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle()
                  if (e.key === 'Escape') {
                    setEditedName(section.name)
                    setIsEditingTitle(false)
                  }
                }}
                autoFocus
                className={cn(
                  'text-lg font-display font-bold text-neutral-900',
                  'bg-transparent border-b-2 border-primary-400',
                  'focus:outline-none px-1'
                )}
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="group/title flex items-center gap-2"
                type="button"
              >
                <span className="text-lg font-display font-bold text-neutral-900">
                  {section.name}
                </span>
                <Edit2 className="w-3.5 h-3.5 text-neutral-400 opacity-0 group-hover/title:opacity-100 transition-opacity" />
              </button>
            )}

            <div className="flex-1" />

            {/* Item count badge */}
            {section.items.length > 0 && (
              <span className="text-xs px-2.5 py-1 bg-secondary-100 border border-secondary-200 text-secondary-700 rounded-full font-heading font-medium">
                {section.items.length} {section.items.length === 1 ? 'place' : 'places'}
              </span>
            )}

            {/* Delete Section */}
            <button
              type="button"
              onClick={onRemoveSection}
              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove section"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-3 animate-fade-in">
              {/* Section Card Container */}
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                {/* Items List */}
                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <SectionItem
                      key={itemIndex}
                      item={item}
                      index={itemIndex}
                      onUpdate={(field, value) => onUpdateItem(itemIndex, field, value)}
                      onRemove={() => onRemoveItem(itemIndex)}
                    />
                  ))}

                  {/* Empty state */}
                  {section.items.length === 0 && (
                    <p className="text-sm text-neutral-500 italic py-2 text-center">
                      {placeholder}
                    </p>
                  )}
                </div>

                {/* Add Item Button */}
                <button
                  type="button"
                  onClick={onAddItem}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 w-full mt-3',
                    'text-sm font-medium text-neutral-600 hover:text-secondary-600',
                    'border-2 border-dashed border-neutral-200 hover:border-secondary-300 rounded-lg',
                    'transition-all duration-200 hover:bg-secondary-50/50'
                  )}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add place</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function SectionCards({ sections, onSectionsChange }: SectionCardsProps) {
  const [showAddModal, setShowAddModal] = useState(false)

  const handleAddSection = (newSection: { name: string; icon: string }) => {
    const newSections = [
      ...sections,
      {
        name: newSection.name,
        icon: newSection.icon,
        sortOrder: sections.length,
        items: [],
      },
    ]
    onSectionsChange(newSections)
  }

  const handleUpdateSection = (index: number, field: keyof Section, value: any) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], [field]: value }
    onSectionsChange(newSections)
  }

  const handleRemoveSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index)
    // Re-calculate sort orders
    newSections.forEach((section, i) => {
      section.sortOrder = i
    })
    onSectionsChange(newSections)
  }

  const handleAddItem = (sectionIndex: number) => {
    const newSections = [...sections]
    newSections[sectionIndex].items.push({
      title: '',
      location: '',
      notes: '',
      sortOrder: newSections[sectionIndex].items.length,
    })
    onSectionsChange(newSections)
  }

  const handleUpdateItem = (
    sectionIndex: number,
    itemIndex: number,
    field: keyof SectionItemData,
    value: string
  ) => {
    const newSections = [...sections]
    newSections[sectionIndex].items[itemIndex] = {
      ...newSections[sectionIndex].items[itemIndex],
      [field]: value,
    }
    onSectionsChange(newSections)
  }

  const handleRemoveItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections]
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter(
      (_, i) => i !== itemIndex
    )
    // Re-calculate sort orders
    newSections[sectionIndex].items.forEach((item, i) => {
      item.sortOrder = i
    })
    onSectionsChange(newSections)
  }

  const existingSectionNames = sections.map((s) => s.name)

  return (
    <>
      <div className="space-y-2">
        {sections.map((section, index) => (
          <SectionCard
            key={`${section.name}-${index}`}
            section={section}
            sectionIndex={index}
            totalSections={sections.length}
            onUpdateSection={(field, value) => handleUpdateSection(index, field, value)}
            onRemoveSection={() => handleRemoveSection(index)}
            onAddItem={() => handleAddItem(index)}
            onUpdateItem={(itemIndex, field, value) =>
              handleUpdateItem(index, itemIndex, field, value)
            }
            onRemoveItem={(itemIndex) => handleRemoveItem(index, itemIndex)}
          />
        ))}
      </div>

      {/* Add Section Button */}
      <div className="mt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowAddModal(true)}
          className="gap-2 font-heading font-bold"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </Button>
      </div>

      {/* Add Section Modal */}
      <AddSectionModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAddSection={handleAddSection}
        existingSectionNames={existingSectionNames}
      />
    </>
  )
}
