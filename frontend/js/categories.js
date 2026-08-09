/** Handles authenticated category creation and category-list rendering. */

import {
    checkAuthentication,
    logoutApplication,
    API_URL,
    apiRequest,
    formatLabel,
} from './api.js'


import { showToast } from './toast.js'
import { renderSkeletonRows } from './skeleton.js'
import { confirmDialog } from './modal.js'

document.addEventListener('DOMContentLoaded', function() { 
    checkAuthentication()

    document
        .getElementById('logoutButton')
        .addEventListener('click', logoutApplication)
        
    createCategory()
    loadCategories()

    document
        .getElementById('categorySearch')
        .addEventListener('input', () => {
            currentPage = 1
            loadCategories()
        })

    document
        .getElementById('previousPage')
        .addEventListener('click', () => {
            currentPage--
            loadCategories()
        })
    document
        .getElementById('nextPage')
        .addEventListener('click', () => {
            currentPage++
            loadCategories()
        })

    window.editCategory = editCategory
    window.deleteCategory = deleteCategory
})

let categories = []
let editingCategoryId = null
let currentPage = 1

/** Connects the category form to authenticated create and update requests. */
const createCategory = async () => {
    const categoryForm = document.getElementById('categoryForm')
    
    if (categoryForm) {
        categoryForm.addEventListener('submit', async function(event) {
            event.preventDefault()

            const formData = new FormData(categoryForm)
            const data = Object.fromEntries(formData)
            const submitButton = document.getElementById('submitCategory')
            const isEditing = editingCategoryId !== null
            let response

            try {
                if (!isEditing) {
                    response = await apiRequest(`${API_URL}/categories/`, 'POST', data)
                } else {
                    response = await apiRequest(`${API_URL}/categories/${editingCategoryId}/`, 'PATCH', data)
                }

                if (response.ok) {
                    categoryForm.reset()
                    showToast(isEditing ? 'Category updated successfully!' : 'Category added successfully!', 'success')
                
                    if (isEditing) {
                        editingCategoryId = null
                        submitButton.textContent = 'Create Category'
                    }

                    currentPage = 1
                    await loadCategories()

                } else {
                    const errorData = await response.json()
                    showToast(JSON.stringify(errorData), 'error')
                }
            } catch (error) {
                console.error('Error:', error)
                showToast('An error occurred while submitting the category. Please try again.', 'error')
            } 
        }   
    )}
}
 
/** Loads and renders the current page of user-owned categories. */
const loadCategories = async () => {
    const categoryTableBody = document.getElementById('categoryTableBody')
    const categorySearchInput = document.getElementById('categorySearch')

    try {
        const searchTerm = categorySearchInput.value.toLowerCase()

        renderSkeletonRows(categoryTableBody, 3)

        const response = await apiRequest(`${API_URL}/categories/?page=${currentPage}&search=${searchTerm}`, 'GET')
        
        if (!response.ok) {
            throw new Error('Failed to load categories')
        }
        const data = await response.json()

        updatePagination(data)
        categories = data.results
        
        categoryTableBody.innerHTML = categories.map(category => `
            <tr>
                <td>${category.category_name}</td>
                <td>${formatLabel(category.frequency)}</td>
                <td>
                    <button onclick="editCategory(${category.id})">Edit</button>
                    <button onclick="deleteCategory(${category.id})">Delete</button>
                </td>
            </tr>
        `).join('')
        
    } catch (error) {
        console.error('Error:', error)
        showToast('An error occurred while loading categories. Please try again.', 'error')
        categoryTableBody.innerHTML = ''
    }
}

/**
 * Loads a rendered category into the form for editing.
 *
 * @param {number} id Category identifier.
 */
const editCategory = (id) => {
    const category = categories.find(category => category.id === id)

    if (!category) {
        showToast('Category not found.', 'error')
        return
    }

    editingCategoryId = id

    document.getElementById('submitCategory').textContent = 'Update Category'
    document.getElementById('categoryName').value = category.category_name
    document.getElementById('frequency').value = category.frequency

    document.getElementsByClassName('categories-layout')[0].scrollIntoView({ behavior: 'smooth', block: 'start'})
}

/**
 * Confirms and deletes a category, updating the current page when needed.
 *
 * @param {number} id Category identifier.
 * @returns {Promise<void>}
 */
const deleteCategory = async (id) => {

    const confirmed = await confirmDialog('Are you sure you want to delete this category? All transactions assigned to this category will also be permanently deleted.', { confirmLabel: 'Delete category' })
    if (!confirmed) {
        return
    }

    if (editingCategoryId === id) {
        editingCategoryId = null
        document.getElementById('categoryForm').reset()
        document.getElementById('submitCategory').textContent = 'Create Category'
    }

    try {
        const response = await apiRequest(`${API_URL}/categories/${id}/`, 'DELETE')

        if (!response.ok) {
            throw new Error('Failed to delete category')
        }

        if (categories.length === 1 && currentPage > 1) {
            currentPage--
        }

        await loadCategories()
        showToast('Category deleted successfully!', 'success')
        
    } catch (error) {
        console.error('Error:', error)
        showToast('An error occurred while deleting the category. Please try again.', 'error')
    }
}

const PAGE_SIZE = 10
/**
 * Updates pagination controls from the paginated API response.
 *
 * @param {{count: number, previous: string|null, next: string|null}} data Paginated response metadata.
 */
const updatePagination = (data) => {
    const previousButton = document.getElementById('previousPage')
    const nextButton = document.getElementById('nextPage')
    const pageInfo = document.getElementById('pageInfo')
    
    previousButton.disabled = data.previous === null
    nextButton.disabled = data.next === null

    const totalPages = Math.max(1, Math.ceil(data.count / PAGE_SIZE))
    
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`
}
