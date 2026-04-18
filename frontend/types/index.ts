// ── Shared enums ─────────────────────────────────────────────────────────────

export type Lang = 'fr' | 'en' | 'ar'
export type MediaType = 'image' | 'video'

// ── RBAC ─────────────────────────────────────────────────────────────────────

export interface Permission {
  id: number
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface RolePermission {
  roleId: number
  permissionId: number
  permission: Permission
  assignedAt: string
}

export interface Role {
  id: number
  name: string
  description: string | null
  permissions?: RolePermission[]
  _count?: { users: number }
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: number
  userId: number
  firstName: string | null
  lastName: string | null
  bio: string | null
  avatar: string | null
  phone: string | null
}

export interface User {
  id: number
  name: string
  email: string
  roleId: number | null
  role?: Role | null
  profile?: Profile | null
  createdAt: string
  updatedAt: string
}

// ── API envelopes ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
}

export interface PaginatedResponse<T = unknown> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiError {
  success: false
  error: { status: number; message: string; detail?: string }
}

// ── Auth DTOs ─────────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string
  password: string
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  roleId?: number | null
}

export interface UpdateUserDto {
  name?: string
  email?: string
  password?: string
  roleId?: number | null
}

export interface CreateRoleDto {
  name: string
  description?: string
}

export interface CreatePermissionDto {
  name: string
  description?: string
}

// ── CMS ───────────────────────────────────────────────────────────────────────

export interface Category {
  id: number
  name: string
  slug: string
  lang: Lang
  subCategories?: SubCategory[]
  _count?: { subCategories: number }
  createdAt: string
  updatedAt: string
}

export interface SubCategory {
  id: number
  name: string
  slug: string
  lang: Lang
  categoryId: number
  category?: Pick<Category, 'id' | 'name' | 'slug' | 'lang'>
  _count?: { articles: number }
  createdAt: string
  updatedAt: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  lang: Lang
  _count?: { articles: number }
  createdAt: string
  updatedAt: string
}

export interface Media {
  id: number
  url: string
  type: MediaType
  alt: string | null
  createdAt: string
  updatedAt: string
}

export interface ArticleTag {
  articleId: number
  tagId: number
  tag: Tag
}

export interface ArticleMedia {
  articleId: number
  mediaId: number
  media: Media
}

export interface Article {
  id: number
  title: string
  slug: string
  content: string
  excerpt: string | null
  lang: Lang
  userId: number
  subCategoryId: number
  user?: { id: number; name: string; email: string }
  subCategory?: SubCategory & { category?: Pick<Category, 'id' | 'name' | 'slug'> }
  tags?: ArticleTag[]
  media?: ArticleMedia[]
  createdAt: string
  updatedAt: string
}

// ── CMS DTOs ──────────────────────────────────────────────────────────────────

export interface CreateCategoryDto { name: string; lang: Lang }
export interface UpdateCategoryDto { name?: string; lang?: Lang }

export interface CreateSubCategoryDto { name: string; lang: Lang; categoryId: number }
export interface UpdateSubCategoryDto { name?: string; lang?: Lang; categoryId?: number }

export interface CreateTagDto { name: string; lang: Lang }
export interface UpdateTagDto { name?: string; lang?: Lang }

export interface CreateMediaDto { url: string; type: MediaType; alt?: string }
export interface UpdateMediaDto { url?: string; type?: MediaType; alt?: string }

export interface CreateArticleDto {
  title: string
  content: string
  excerpt?: string
  lang: Lang
  subCategoryId: number
  tagIds?: number[]
  mediaIds?: number[]
}

export interface UpdateArticleDto {
  title?: string
  content?: string
  excerpt?: string
  lang?: Lang
  subCategoryId?: number
  tagIds?: number[]
  mediaIds?: number[]
}
