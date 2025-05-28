// src/components/ui/dropdown-menu.jsx
import React from 'react'
import * as RadixDropdown from '@radix-ui/react-dropdown-menu'

// Root wrapper
export const DropdownMenu = RadixDropdown.Root

// Trigger button wrapper (use asChild for native button)
export const DropdownMenuTrigger = RadixDropdown.Trigger

// Portal for rendering content at the end of the DOM (optional)
export const DropdownMenuPortal = RadixDropdown.Portal

// The visible dropdown panel
export const DropdownMenuContent = RadixDropdown.Content

// Individual menu items
export const DropdownMenuItem = RadixDropdown.Item

// Sub-menus, labels, separators, etc.
export const DropdownMenuGroup = RadixDropdown.Group
export const DropdownMenuLabel = RadixDropdown.Label
export const DropdownMenuSeparator = RadixDropdown.Separator
export const DropdownMenuCheckboxItem = RadixDropdown.CheckboxItem
export const DropdownMenuRadioGroup = RadixDropdown.RadioGroup
export const DropdownMenuRadioItem = RadixDropdown.RadioItem
export const DropdownMenuItemIndicator = RadixDropdown.ItemIndicator
