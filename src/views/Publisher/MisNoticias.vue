<template>
  <div class="mis-noticias">

    <!-- Toast -->
    <Transition name="toast-slide">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        <span class="toast-icon-wrap">
          <svg v-if="toast.type==='success'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else-if="toast.type==='error'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
        </span>
        <div class="toast-body">
          <strong>{{ toast.title }}</strong>
          <span>{{ toast.message }}</span>
        </div>
        <button class="toast-close" @click="toast.show = false">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </Transition>

    <!-- Confirm delete modal -->
    <Transition name="modal-fade">
      <div v-if="deleteModal.show" class="modal-overlay" @click.self="deleteModal.show = false">
        <div class="modal-box">
          <div class="modal-icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </div>
          <h3>Eliminar noticia</h3>
          <p>¿Estás seguro de eliminar <strong>"{{ deleteModal.title }}"</strong>?<br>Esta acción no se puede deshacer.</p>
          <div class="modal-actions">
            <button class="btn-cancel-modal" @click="deleteModal.show = false">Cancelar</button>
            <button class="btn-confirm-delete" @click="confirmDelete" :disabled="deleteModal.loading">
              <span v-if="!deleteModal.loading">Eliminar definitivamente</span>
              <span v-else class="loading-row"><span class="spinner-xs"></span> Eliminando...</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a3a52" stroke-width="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        </div>
        <div>
          <h1>Mis Noticias</h1>
          <p>Gestiona y administra tus publicaciones</p>
        </div>
      </div>
      <router-link to="/publicador/crear-noticia" class="btn-new">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nueva Noticia
      </router-link>
    </div>

    <!-- Stats Row -->
    <div class="stats-row" v-if="!loading && !error">
      <button class="stat-pill" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">
        <span class="stat-num">{{ news.length }}</span>
        <span class="stat-txt">Total</span>
      </button>
      <button class="stat-pill stat-pub" :class="{ active: activeFilter === 'published' }" @click="activeFilter = 'published'">
        <span class="stat-num">{{ news.filter(n => n.published).length }}</span>
        <span class="stat-txt">Publicadas</span>
      </button>
      <button class="stat-pill stat-draft" :class="{ active: activeFilter === 'draft' }" @click="activeFilter = 'draft'">
        <span class="stat-num">{{ news.filter(n => !n.published).length }}</span>
        <span class="stat-txt">Borradores</span>
      </button>
    </div>

    <!-- Filters Bar -->
    <div class="filters-bar">
      <div class="search-wrap">
        <svg class="search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="search" type="text" class="search-input" placeholder="Buscar por título..." />
        <button v-if="search" class="search-clear" @click="search = ''">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="right-filters">
        <!-- Category filter -->
        <div class="select-wrap">
          <select v-model="categoryFilter" class="filter-select">
            <option value="">Todas las categorías</option>
            <option v-for="c in categories" :key="c.value" :value="c.value">{{ c.label }}</option>
          </select>
          <svg class="sel-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>

        <!-- Career filter -->
        <div class="select-wrap">
          <select v-model="careerFilter" class="filter-select">
            <option value="">Todas las carreras</option>
            <option value="null">General (sin carrera)</option>
            <option v-for="c in availableCareers" :key="c.id" :value="String(c.id)">{{ c.name }}</option>
          </select>
          <svg class="sel-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>

        <!-- Sort -->
        <div class="select-wrap">
          <select v-model="sortBy" class="filter-select">
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguas</option>
            <option value="title">A–Z título</option>
          </select>
          <svg class="sel-arrow" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </div>

        <!-- View toggle -->
        <div class="view-toggle">
          <button :class="{ active: viewMode === 'feed' }" @click="viewMode = 'feed'" title="Feed">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="5" rx="1"/><rect x="3" y="10" width="18" height="11" rx="1"/></svg>
          </button>
          <button :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'" title="Cuadrícula">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          </button>
          <button :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'" title="Lista">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Active filter chips -->
    <div class="active-chips" v-if="categoryFilter || careerFilter || search">
      <span class="chips-label">Filtros activos:</span>
      <span class="chip" v-if="search">
        "{{ search }}"
        <button @click="search = ''"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </span>
      <span class="chip" v-if="categoryFilter">
        {{ getCategoryLabel(categoryFilter) }}
        <button @click="categoryFilter = ''"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </span>
      <span class="chip" v-if="careerFilter">
        {{ careerFilter === 'null' ? 'General' : getCareerName(careerFilter) }}
        <button @click="careerFilter = ''"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </span>
      <button class="chip-clear-all" @click="clearAllFilters">Limpiar todo</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="state-box">
      <div class="state-spinner"></div>
      <p>Cargando noticias...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-box state-error">
      <div class="state-icon-wrap error-wrap">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <p>{{ error }}</p>
      <button class="btn-retry" @click="loadNews">Reintentar</button>
    </div>

    <!-- Empty total -->
    <div v-else-if="news.length === 0" class="state-box state-empty">
      <div class="state-icon-wrap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/></svg>
      </div>
      <h3>No has publicado noticias aún</h3>
      <p>Crea tu primera noticia para que aparezca aquí.</p>
      <router-link to="/publicador/crear-noticia" class="btn-new-empty">
        Crear primera noticia
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </router-link>
    </div>

    <!-- No results -->
    <div v-else-if="filteredNews.length === 0" class="state-box state-empty">
      <div class="state-icon-wrap">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
      <h3>Sin resultados</h3>
      <p>No se encontraron noticias con ese criterio.</p>
      <button class="btn-retry" @click="clearAllFilters">Limpiar filtros</button>
    </div>

    <!-- ═══════════════════════════════
         FEED VIEW — estilo Facebook
    ════════════════════════════════ -->
    <div v-else-if="viewMode === 'feed'" class="feed-list">
      <article v-for="item in filteredNews" :key="item.id" class="fb-card" :class="{ 'is-draft': !item.published }">

        <!-- Header: author row -->
        <div class="fb-card-header">
          <div class="fb-avatar">{{ authorInitials }}</div>
          <div class="fb-author-info">
            <div class="fb-author-name">
              {{ authorName }}
              <span class="fb-author-role">· Publicador UCB</span>
            </div>
            <div class="fb-meta-row">
              <time class="fb-time">{{ formatDateRelative(item.createdAt) }}</time>
              <span class="fb-dot">·</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              <span class="fb-audience">{{ item.careerId ? getCareerName(String(item.careerId)) : 'Toda la comunidad' }}</span>
              <span class="fb-dot">·</span>
              <span class="fb-status-badge" :class="item.published ? 'fb-pub' : 'fb-draft'">
                <span class="fb-status-dot"></span>
                {{ item.published ? 'Publicada' : 'Borrador' }}
              </span>
            </div>
          </div>
          <!-- Menu -->
          <div class="fb-menu-wrap">
            <button class="fb-menu-btn" @click="toggleMenu(item.id)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
            </button>
            <Transition name="menu-drop">
              <div v-if="openMenu === item.id" class="fb-dropdown">
                <router-link :to="`/publicador/editar-noticia/${item.id}`" class="fb-dd-item" @click="closeMenu(item.id)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar noticia
                </router-link>
                <button class="fb-dd-item" @click="togglePublish(item); closeMenu(item.id)" :disabled="item._saving">
                  <svg v-if="item.published" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 12H3"/><polyline points="7 8 3 12 7 16"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  {{ item.published ? 'Despublicar' : 'Publicar ahora' }}
                </button>
                <div class="fb-dd-divider"></div>
                <button class="fb-dd-item fb-dd-danger" @click="askDelete(item); closeMenu(item.id)">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  Eliminar noticia
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Category -->
        <div class="fb-cat-row">
          <span class="fb-cat-tag">{{ getCategoryLabel(item.category) }}</span>
        </div>

        <!-- Title -->
        <h2 class="fb-title">{{ item.title }}</h2>

        <!-- Body with See more / less -->
        <div class="fb-body-container">
          <div class="fb-body" :class="{ 'fb-body-expanded': item._expanded }">
            <div v-html="renderBody(item.body)"></div>
          </div>
          <div v-if="!item._expanded && needsTruncation(item.body)" class="fb-body-gradient"></div>
          <button
            v-if="needsTruncation(item.body)"
            class="fb-see-more-btn"
            @click="item._expanded = !item._expanded"
          >
            <span>{{ item._expanded ? 'Ver menos' : 'Ver más' }}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
              :style="{ transform: item._expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s' }">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>

        <!-- Cover image — below text like Facebook -->
        <div class="fb-image-wrap" v-if="item.coverUrl">
          <img :src="item.coverUrl" :alt="item.title" class="fb-image" @error="item.coverUrl = null" />
        </div>

        <!-- Attachment -->
        <div class="fb-attachment" v-if="item.attachmentUrl">
          <div class="fb-attach-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a3a52" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <div class="fb-attach-info">
            <span class="fb-attach-label">Documento adjunto</span>
            <a :href="item.attachmentUrl" target="_blank" rel="noopener" class="fb-attach-link">Ver documento →</a>
          </div>
        </div>

        <!-- Divider -->
        <div class="fb-divider"></div>

        <!-- Footer action bar -->
        <div class="fb-action-bar">
          <router-link :to="`/publicador/editar-noticia/${item.id}`" class="fb-act-btn fb-act-edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </router-link>
          <button
            class="fb-act-btn"
            :class="item.published ? 'fb-act-unpub' : 'fb-act-pub'"
            @click="togglePublish(item)"
            :disabled="item._saving"
          >
            <span class="spinner-xs" v-if="item._saving"></span>
            <template v-else>
              <svg v-if="item.published" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 12H3"/><polyline points="7 8 3 12 7 16"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              {{ item.published ? 'Despublicar' : 'Publicar' }}
            </template>
          </button>
          <button class="fb-act-btn fb-act-del" @click="askDelete(item)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
            Eliminar
          </button>
        </div>

        <!-- Draft watermark -->
        <div class="draft-watermark" v-if="!item.published">BORRADOR</div>
      </article>
    </div>

    <!-- ══════════ GRID ══════════ -->
    <div v-else-if="viewMode === 'grid'" class="news-grid">
      <article v-for="item in filteredNews" :key="item.id" class="news-card" :class="{ 'is-draft': !item.published }">
        <div class="card-img-wrap">
          <img v-if="item.coverUrl" :src="item.coverUrl" :alt="item.title" class="card-img" @error="item.coverUrl = null" />
          <div v-else class="card-img-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/></svg>
          </div>
          <div class="card-overlay-top">
            <span class="badge-cat">{{ getCategoryLabel(item.category) }}</span>
            <span class="badge-status" :class="item.published ? 'status-pub' : 'status-draft'">
              <span class="status-dot"></span>{{ item.published ? 'Publicada' : 'Borrador' }}
            </span>
          </div>
        </div>
        <div class="card-content">
          <div class="card-meta-row">
            <time class="card-date">{{ formatDate(item.createdAt) }}</time>
            <span v-if="item.careerId" class="card-career">{{ getCareerName(String(item.careerId)) }}</span>
          </div>
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-excerpt">{{ excerpt(item.body) }}</p>
        </div>
        <div class="card-actions">
          <router-link :to="`/publicador/editar-noticia/${item.id}`" class="action-btn btn-edit">Editar</router-link>
          <button class="action-btn" :class="item.published ? 'btn-unpublish' : 'btn-publish-action'" @click="togglePublish(item)" :disabled="item._saving">
            <span class="spinner-xs" v-if="item._saving"></span>
            <template v-else>{{ item.published ? 'Despublicar' : 'Publicar' }}</template>
          </button>
          <button class="action-btn btn-delete" @click="askDelete(item)">Eliminar</button>
        </div>
      </article>
    </div>

    <!-- ══════════ LIST ══════════ -->
    <div v-else class="news-list">
      <div v-for="item in filteredNews" :key="item.id" class="list-row" :class="{ 'is-draft': !item.published }">
        <div class="list-img">
          <img v-if="item.coverUrl" :src="item.coverUrl" :alt="item.title" @error="item.coverUrl = null" />
          <div v-else class="list-img-placeholder">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v8a2 2 0 01-2 2z"/></svg>
          </div>
        </div>
        <div class="list-content">
          <div class="list-badges">
            <span class="badge-cat small">{{ getCategoryLabel(item.category) }}</span>
            <span class="badge-status small" :class="item.published ? 'status-pub' : 'status-draft'">
              <span class="status-dot"></span>{{ item.published ? 'Publicada' : 'Borrador' }}
            </span>
            <span v-if="item.careerId" class="badge-career">{{ getCareerName(String(item.careerId)) }}</span>
          </div>
          <h3 class="list-title">{{ item.title }}</h3>
          <p class="list-excerpt">{{ excerpt(item.body) }}</p>
          <div class="list-meta"><time>{{ formatDate(item.createdAt) }}</time></div>
        </div>
        <div class="list-actions">
          <router-link :to="`/publicador/editar-noticia/${item.id}`" class="icon-btn" title="Editar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </router-link>
          <button class="icon-btn" :class="item.published ? 'ico-unpublish' : 'ico-publish'" @click="togglePublish(item)" :disabled="item._saving" :title="item.published ? 'Despublicar' : 'Publicar'">
            <span class="spinner-xs" v-if="item._saving"></span>
            <svg v-else-if="item.published" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 12H3"/><polyline points="7 8 3 12 7 16"/></svg>
            <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
          <button class="icon-btn ico-delete" @click="askDelete(item)" title="Eliminar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { careerService } from '../../services/api.js'

const news             = ref([])
const loading          = ref(false)
const error            = ref('')
const search           = ref('')
const activeFilter     = ref('all')
const categoryFilter   = ref('')
const careerFilter     = ref('')
const sortBy           = ref('newest')
const viewMode         = ref('feed')
const openMenu         = ref(null)
const availableCareers = ref([])

const authorEmail    = localStorage.getItem('ucb_email') || ''
const authorName     = localStorage.getItem('ucb_name') || authorEmail.split('@')[0] || 'Publicador'
const authorInitials = authorName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'P'

const toast       = reactive({ show: false, type: 'success', title: '', message: '' })
const deleteModal = reactive({ show: false, id: null, title: '', loading: false })

// ── Categories ──
const categories = [
  { value: 'ACADEMICO', label: 'Académico' },
  { value: 'INSTITUCIONAL', label: 'Institucional' },
  { value: 'AVISOS',    label: 'Avisos' },
  { value: 'DEPORTES',  label: 'Deportes' },
  { value: 'CULTURA',   label: 'Cultura' },
  { value: 'OTRO',      label: 'Otro' }
]

// ── Helpers ──
function getCategoryLabel(val) {
  return categories.find(c => c.value === val)?.label || val || '—'
}

function getCareerName(idStr) {
  if (idStr === 'null' || !idStr) return 'General'
  const found = availableCareers.value.find(c => String(c.id) === idStr)
  return found ? found.name : `Carrera ${idStr}`
}

function excerpt(text) {
  if (!text) return ''
  const plain = text.replace(/\*\*|__|\*|_|#{1,6}\s?|`/g, '').replace(/\n/g, ' ').trim()
  return plain.length > 120 ? plain.substring(0, 120) + '...' : plain
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateRelative(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Ahora mismo'
  if (mins < 60)  return `Hace ${mins} min`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 7)   return `Hace ${days} días`
  return formatDate(dateStr)
}

// Body over 350 chars needs truncation
function needsTruncation(body) {
  return body && body.replace(/\*\*|__|\*|_|#{1,6}\s?|`/g, '').length > 350
}

function renderBody(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^## (.+)$/gm, '<h3 class="body-h3">$1</h3>')
    .replace(/^> (.+)$/gm, '<blockquote class="body-quote">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="body-li">$1</li>')
    .replace(/---/g, '<hr class="body-hr"/>')
    .replace(/\n/g, '<br/>')
}

function clearAllFilters() {
  search.value = ''
  categoryFilter.value = ''
  careerFilter.value = ''
  activeFilter.value = 'all'
}

// ── Menu ──
function toggleMenu(id) {
  openMenu.value = openMenu.value === id ? null : id
}
function closeMenu() {
  openMenu.value = null
}

// Close menu on outside click
function handleOutsideClick(e) {
  if (!e.target.closest('.fb-menu-wrap')) {
    openMenu.value = null
  }
}

// ── Filtered + sorted list ──
const filteredNews = computed(() => {
  let list = [...news.value]

  if (activeFilter.value === 'published') list = list.filter(n => n.published)
  if (activeFilter.value === 'draft')     list = list.filter(n => !n.published)
  if (categoryFilter.value)               list = list.filter(n => n.category === categoryFilter.value)

  if (careerFilter.value === 'null') {
    list = list.filter(n => !n.careerId)
  } else if (careerFilter.value) {
    list = list.filter(n => String(n.careerId) === careerFilter.value)
  }

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(n => n.title?.toLowerCase().includes(q))
  }

  if (sortBy.value === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  if (sortBy.value === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  if (sortBy.value === 'title')  list.sort((a, b) => a.title?.localeCompare(b.title))

  return list
})

// ── Toast ──
function showToast(type, title, message) {
  toast.show = false
  setTimeout(() => {
    Object.assign(toast, { show: true, type, title, message })
    setTimeout(() => { toast.show = false }, 4500)
  }, 60)
}

// ── Auth ──
function getHeaders() {
  const token = localStorage.getItem('ucb_token')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

// ── Load ──
async function loadNews() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('http://localhost:8081/api/news/my', { headers: getHeaders(), mode: 'cors' })
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || `Error ${res.status}`) }
    news.value = (await res.json()).map(n => ({ ...n, _saving: false, _expanded: false }))
  } catch (err) {
    error.value = err.name === 'TypeError' ? 'No se pudo conectar con el servidor.' : err.message
  } finally {
    loading.value = false
  }
}

// ── Toggle publish ──
async function togglePublish(item) {
  item._saving = true
  try {
    const res = await fetch(`http://localhost:8081/api/news/${item.id}`, {
      method: 'PUT', headers: getHeaders(), mode: 'cors',
      body: JSON.stringify({ published: !item.published })
    })
    if (!res.ok) throw new Error()
    item.published = (await res.json()).published
    showToast('success', item.published ? 'Noticia publicada' : 'Noticia despublicada',
      `"${item.title}" fue actualizada.`)
  } catch {
    showToast('error', 'Error', 'No se pudo actualizar el estado.')
  } finally {
    item._saving = false
  }
}

// ── Delete ──
function askDelete(item) {
  Object.assign(deleteModal, { show: true, id: item.id, title: item.title, loading: false })
}

async function confirmDelete() {
  deleteModal.loading = true
  try {
    const res = await fetch(`http://localhost:8081/api/news/${deleteModal.id}`, {
      method: 'DELETE', headers: getHeaders(), mode: 'cors'
    })
    if (!res.ok) throw new Error()
    const title = deleteModal.title
    news.value = news.value.filter(n => n.id !== deleteModal.id)
    deleteModal.show = false
    showToast('success', 'Eliminada', `"${title}" fue eliminada correctamente.`)
  } catch {
    showToast('error', 'Error', 'No se pudo eliminar la noticia.')
  } finally {
    deleteModal.loading = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleOutsideClick)
  await loadNews()
  try { availableCareers.value = await careerService.getAll() } catch {}
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.mis-noticias { font-family: 'Inter', sans-serif; color: #1e293b; padding-bottom: 3rem; }

/* ── Toast ── */
.toast { position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999; display: flex; align-items: center; gap: 0.75rem; padding: 0.9rem 1.1rem; background: #fff; border-radius: 10px; box-shadow: 0 4px 24px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05); border-left: 3px solid; min-width: 300px; max-width: 400px; }
.toast-success { border-left-color: #22c55e; }
.toast-error   { border-left-color: #ef4444; }
.toast-warning { border-left-color: #f59e0b; }
.toast-icon-wrap { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.toast-success .toast-icon-wrap { background: #dcfce7; color: #16a34a; }
.toast-error   .toast-icon-wrap { background: #fee2e2; color: #dc2626; }
.toast-warning .toast-icon-wrap { background: #fef3c7; color: #d97706; }
.toast-body { flex: 1; }
.toast-body strong { display: block; font-size: 0.83rem; font-weight: 600; color: #1e293b; margin-bottom: 1px; }
.toast-body span   { font-size: 0.77rem; color: #64748b; }
.toast-close { background: none; border: none; cursor: pointer; color: #94a3b8; padding: 4px; border-radius: 4px; display: flex; }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.28s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateX(28px); }

/* ── Modal ── */
.modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(15,23,42,0.5); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-box { background: #fff; border-radius: 16px; padding: 2.2rem 2rem; max-width: 420px; width: 100%; text-align: center; box-shadow: 0 24px 60px rgba(0,0,0,0.18); animation: popIn 0.22s cubic-bezier(0.34,1.56,0.64,1); }
@keyframes popIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
.modal-icon-wrap { width: 56px; height: 56px; background: #fff1f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.2rem; }
.modal-box h3 { font-family:'Syne',sans-serif; font-size:1.1rem; font-weight:800; color:#1e293b; margin-bottom:0.6rem; }
.modal-box p { font-size:0.85rem; color:#64748b; line-height:1.65; margin-bottom:1.8rem; }
.modal-actions { display:flex; gap:0.75rem; justify-content:center; }
.btn-cancel-modal { padding:0.62rem 1.4rem; border:1.5px solid #e2e8f0; background:#fff; color:#64748b; border-radius:8px; font-size:0.83rem; font-weight:500; cursor:pointer; transition:all 0.18s; }
.btn-cancel-modal:hover { background:#f8fafc; }
.btn-confirm-delete { padding:0.62rem 1.4rem; background:#ef4444; color:#fff; border:none; border-radius:8px; font-size:0.83rem; font-weight:600; cursor:pointer; transition:all 0.18s; display:flex; align-items:center; gap:0.5rem; }
.btn-confirm-delete:hover:not(:disabled) { background:#dc2626; }
.btn-confirm-delete:disabled { opacity:0.55; cursor:not-allowed; }
.modal-fade-enter-active, .modal-fade-leave-active { transition:opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity:0; }

/* ── Header ── */
.page-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.6rem; padding-bottom:1.4rem; border-bottom:1px solid #f1f5f9; }
.header-left { display:flex; align-items:center; gap:0.9rem; }
.header-icon { width:46px; height:46px; background:#FFD200; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 2px 8px rgba(255,210,0,0.3); }
.page-header h1 { font-family:'Syne',sans-serif; font-size:1.55rem; font-weight:800; color:#0f172a; letter-spacing:-0.5px; margin-bottom:0.1rem; }
.page-header p { font-size:0.81rem; color:#64748b; }
.btn-new { display:flex; align-items:center; gap:0.5rem; padding:0.65rem 1.3rem; background:#1a3a52; color:#FFD200; border:none; border-radius:9px; font-size:0.83rem; font-weight:600; text-decoration:none; transition:all 0.18s; font-family:'Inter',sans-serif; }
.btn-new:hover { background:#0f2438; transform:translateY(-1px); box-shadow:0 4px 14px rgba(26,58,82,0.25); }

/* ── Stats ── */
.stats-row { display:flex; gap:0.7rem; margin-bottom:1.4rem; flex-wrap:wrap; }
.stat-pill { display:flex; align-items:center; gap:0.55rem; padding:0.58rem 1.1rem; border:1.5px solid #e2e8f0; border-radius:50px; background:#fff; cursor:pointer; transition:all 0.18s; font-family:'Inter',sans-serif; }
.stat-pill:hover { border-color:#1a3a52; }
.stat-pill.active { background:#1a3a52; border-color:#1a3a52; }
.stat-pill.active .stat-num, .stat-pill.active .stat-txt { color:#FFD200; }
.stat-num { font-family:'Syne',sans-serif; font-size:1rem; font-weight:800; color:#1e293b; }
.stat-txt { font-size:0.77rem; color:#64748b; font-weight:500; }
.stat-pub .stat-num { color:#16a34a; }
.stat-draft .stat-num { color:#d97706; }

/* ── Filters ── */
.filters-bar { display:flex; align-items:center; justify-content:space-between; gap:0.8rem; margin-bottom:0.9rem; flex-wrap:wrap; }
.search-wrap { position:relative; display:flex; align-items:center; flex:1; min-width:200px; }
.search-ico { position:absolute; left:0.85rem; pointer-events:none; }
.search-input { width:100%; padding:0.62rem 2.4rem 0.62rem 2.3rem; border:1.5px solid #e2e8f0; border-radius:9px; font-size:0.85rem; font-family:'Inter',sans-serif; color:#1e293b; background:#fff; outline:none; transition:border-color 0.18s; }
.search-input:focus { border-color:#FFD200; box-shadow:0 0 0 3px rgba(255,210,0,0.08); }
.search-clear { position:absolute; right:0.7rem; background:none; border:none; cursor:pointer; color:#94a3b8; display:flex; align-items:center; padding:3px; }
.search-clear:hover { color:#ef4444; }
.right-filters { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; }
.select-wrap { position:relative; }
.filter-select { padding:0.58rem 2rem 0.58rem 0.85rem; border:1.5px solid #e2e8f0; border-radius:8px; font-size:0.82rem; font-family:'Inter',sans-serif; color:#475569; background:#fff; outline:none; cursor:pointer; appearance:none; transition:border-color 0.18s; }
.filter-select:focus { border-color:#FFD200; }
.sel-arrow { position:absolute; right:0.6rem; top:50%; transform:translateY(-50%); pointer-events:none; }
.view-toggle { display:flex; border:1.5px solid #e2e8f0; border-radius:8px; overflow:hidden; }
.view-toggle button { padding:0.52rem 0.65rem; background:#fff; border:none; cursor:pointer; color:#94a3b8; transition:all 0.18s; display:flex; align-items:center; }
.view-toggle button:hover { background:#f8fafc; }
.view-toggle button.active { background:#1a3a52; color:#FFD200; }
.view-toggle button.active svg { stroke:#FFD200; }

/* ── Filter chips ── */
.active-chips { display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.2rem; }
.chips-label { font-size:0.74rem; color:#94a3b8; font-weight:600; }
.chip { display:flex; align-items:center; gap:0.35rem; background:#f1f5f9; color:#475569; border-radius:20px; padding:3px 10px; font-size:0.75rem; font-weight:500; }
.chip button { background:none; border:none; cursor:pointer; color:#94a3b8; display:flex; align-items:center; line-height:1; }
.chip button:hover { color:#ef4444; }
.chip-clear-all { background:none; border:1px solid #e2e8f0; border-radius:20px; padding:3px 10px; font-size:0.74rem; color:#64748b; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.15s; }
.chip-clear-all:hover { background:#fee2e2; border-color:#fecdd3; color:#dc2626; }

/* ── States ── */
.state-box { background:#fff; border-radius:14px; padding:4rem 2rem; text-align:center; border:1px solid #f1f5f9; display:flex; flex-direction:column; align-items:center; gap:0.85rem; }
.state-spinner { width:34px; height:34px; border:2.5px solid #f1f5f9; border-top-color:#FFD200; border-radius:50%; animation:spin 0.65s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.state-box p { font-size:0.86rem; color:#64748b; }
.state-box h3 { font-family:'Syne',sans-serif; font-size:1.05rem; color:#1e293b; font-weight:700; }
.state-icon-wrap { width:56px; height:56px; background:#f8fafc; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.error-wrap { background:#fff1f2; }
.state-error p { color:#dc2626; }
.btn-retry { padding:0.55rem 1.3rem; background:#1a3a52; color:#FFD200; border:none; border-radius:7px; font-size:0.82rem; font-weight:600; cursor:pointer; font-family:'Inter',sans-serif; }
.btn-retry:hover { background:#0f2438; }
.btn-new-empty { display:flex; align-items:center; gap:0.5rem; padding:0.65rem 1.4rem; background:#1a3a52; color:#FFD200; border-radius:9px; text-decoration:none; font-size:0.84rem; font-weight:600; font-family:'Inter',sans-serif; }
.btn-new-empty:hover { background:#0f2438; }

/* ══════════════════════════════════════════
   FEED — estilo Facebook
══════════════════════════════════════════ */
.feed-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.2rem;
  align-items: start;
}

.fb-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  overflow: hidden;
  position: relative;
  transition: box-shadow 0.2s;
}
.fb-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.fb-card.is-draft { border-color: #fde68a; background: linear-gradient(to bottom, #fffef7, #fff); }

/* Header */
.fb-card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1.1rem 1.2rem 0;
}

.fb-avatar {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, #1a3a52, #2c5aa0);
  color: #FFD200;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif;
  font-size: 1rem; font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(26,58,82,0.3);
}

.fb-author-info { flex: 1; min-width: 0; }
.fb-author-name {
  font-size: 0.9rem; font-weight: 700; color: #1e293b;
  display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;
}
.fb-author-role { font-size: 0.78rem; font-weight: 400; color: #64748b; }
.fb-meta-row { display: flex; align-items: center; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.2rem; }
.fb-time { font-size: 0.74rem; color: #94a3b8; }
.fb-dot { font-size: 0.7rem; color: #cbd5e1; }
.fb-audience { font-size: 0.74rem; color: #94a3b8; }
.fb-status-badge { display: flex; align-items: center; gap: 0.25rem; font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
.fb-pub   { background: #dcfce7; color: #15803d; }
.fb-draft { background: #fef3c7; color: #92400e; }
.fb-status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

/* 3-dot menu */
.fb-menu-wrap { position: relative; flex-shrink: 0; }
.fb-menu-btn {
  width: 36px; height: 36px; border-radius: 50%;
  background: none; border: none; cursor: pointer; color: #94a3b8;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.fb-menu-btn:hover { background: #f1f5f9; color: #475569; }
.fb-dropdown {
  position: absolute; top: calc(100% + 4px); right: 0; z-index: 50;
  background: #fff; border-radius: 10px; padding: 0.4rem;
  box-shadow: 0 8px 30px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06);
  min-width: 180px;
}
.fb-dd-item {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.55rem 0.75rem; border-radius: 7px;
  font-size: 0.83rem; font-weight: 500; color: #475569;
  text-decoration: none; border: none; background: none; cursor: pointer; width: 100%;
  transition: background 0.15s; font-family: 'Inter', sans-serif;
}
.fb-dd-item:hover { background: #f8fafc; color: #1e293b; }
.fb-dd-item:disabled { opacity: 0.5; cursor: not-allowed; }
.fb-dd-divider { height: 1px; background: #f1f5f9; margin: 0.3rem 0; }
.fb-dd-danger { color: #ef4444; }
.fb-dd-danger:hover { background: #fff1f2; }
.menu-drop-enter-active, .menu-drop-leave-active { transition: all 0.15s ease; }
.menu-drop-enter-from, .menu-drop-leave-to { opacity: 0; transform: translateY(-6px) scale(0.97); }

/* Category row */
.fb-cat-row { padding: 0.55rem 1.2rem 0; }
.fb-cat-tag {
  display: inline-block; font-size: 0.68rem; font-weight: 700;
  padding: 3px 10px; border-radius: 20px;
  background: #1a3a52; color: #FFD200; letter-spacing: 0.3px;
}

/* Title */
.fb-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.15rem; font-weight: 800; color: #0f172a;
  line-height: 1.35; letter-spacing: -0.3px;
  padding: 0.45rem 1.2rem 0;
}

/* Body with see more */
.fb-body-container {
  padding: 0.55rem 1.2rem 0;
  position: relative;
}

.fb-body {
  font-size: 0.9rem; line-height: 1.7; color: #374151;
  max-height: 120px;
  overflow: hidden;
  transition: max-height 0.35s ease;
}
.fb-body.fb-body-expanded {
  max-height: 9999px;
}

/* Deep styles for rendered body content */
.fb-body :deep(.body-h3) { font-size: 0.95rem; font-weight: 700; margin: 0.65rem 0 0.25rem; color: #1e293b; }
.fb-body :deep(.body-quote) { border-left: 3px solid #FFD200; padding-left: 0.75rem; color: #64748b; margin: 0.5rem 0; font-style: italic; }
.fb-body :deep(.body-li) { margin-left: 1.1rem; }
.fb-body :deep(.body-hr) { border: none; border-top: 1px solid #e2e8f0; margin: 0.65rem 0; }

.fb-body-gradient {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 50px;
  background: linear-gradient(transparent, #fff);
  pointer-events: none;
}
.fb-card.is-draft .fb-body-gradient { background: linear-gradient(transparent, #fffef7); }

.fb-see-more-btn {
  display: flex; align-items: center; gap: 0.3rem;
  background: none; border: none; cursor: pointer;
  font-size: 0.84rem; font-weight: 600; color: #1a3a52;
  padding: 0.4rem 0 0; font-family: 'Inter', sans-serif;
  transition: color 0.15s;
}
.fb-see-more-btn:hover { color: #0f2438; }

/* Cover image */
.fb-image-wrap {
  margin-top: 0.9rem;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}
.fb-image { width: 100%; max-height: 420px; object-fit: cover; display: block; }

/* Attachment */
.fb-attachment {
  display: flex; align-items: center; gap: 0.85rem;
  margin: 0.75rem 1.2rem 0;
  padding: 0.75rem 1rem;
  background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;
}
.fb-attach-icon { width: 40px; height: 40px; background: #eff6ff; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.fb-attach-info { flex: 1; }
.fb-attach-label { display: block; font-size: 0.72rem; color: #94a3b8; font-weight: 500; }
.fb-attach-link { font-size: 0.82rem; font-weight: 600; color: #1a3a52; text-decoration: none; }
.fb-attach-link:hover { text-decoration: underline; }

/* Divider */
.fb-divider { height: 1px; background: #f1f5f9; margin: 0.85rem 1.2rem 0; }

/* Action bar */
.fb-action-bar {
  display: flex; gap: 0.35rem; padding: 0.6rem 1.2rem 1rem;
}
.fb-act-btn {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 0.9rem; border-radius: 8px; border: 1.5px solid #e2e8f0;
  background: #fff; font-size: 0.78rem; font-weight: 600; cursor: pointer;
  color: #475569; transition: all 0.18s; font-family: 'Inter', sans-serif;
  text-decoration: none;
}
.fb-act-edit:hover   { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.fb-act-pub:hover    { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.fb-act-unpub:hover  { background: #fff7ed; border-color: #fed7aa; color: #c2410c; }
.fb-act-del:hover    { background: #fff1f2; border-color: #fecdd3; color: #be123c; }
.fb-act-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* Draft watermark */
.draft-watermark {
  position: absolute; inset: 0; pointer-events: none;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif; font-size: 3rem; font-weight: 800;
  color: rgba(217,119,6,0.06); letter-spacing: 8px;
  transform: rotate(-12deg); user-select: none;
}

/* ══════════ GRID ══════════ */
.news-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:1.2rem; }
.news-card { background:#fff; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0; transition:transform 0.2s, box-shadow 0.2s; display:flex; flex-direction:column; }
.news-card:hover { transform:translateY(-3px); box-shadow:0 10px 32px rgba(0,0,0,0.09); }
.news-card.is-draft { border-color:#fde68a; background:#fffef7; }
.card-img-wrap { position:relative; height:170px; background:#f8fafc; overflow:hidden; flex-shrink:0; }
.card-img { width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.35s; }
.news-card:hover .card-img { transform:scale(1.04); }
.card-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#f8fafc,#f1f5f9); }
.card-overlay-top { position:absolute; top:0.7rem; left:0.7rem; right:0.7rem; display:flex; justify-content:space-between; align-items:flex-start; gap:0.4rem; }
.badge-cat { font-size:0.66rem; font-weight:700; padding:3px 9px; border-radius:20px; background:rgba(26,58,82,0.88); color:#FFD200; backdrop-filter:blur(4px); }
.badge-cat.small { font-size:0.64rem; }
.badge-status { display:flex; align-items:center; gap:0.3rem; font-size:0.66rem; font-weight:600; padding:3px 9px; border-radius:20px; backdrop-filter:blur(4px); }
.badge-status.small { font-size:0.64rem; }
.status-pub  { background:rgba(220,252,231,0.92); color:#15803d; }
.status-draft{ background:rgba(254,243,199,0.92); color:#92400e; }
.status-dot { width:5px; height:5px; border-radius:50%; background:currentColor; flex-shrink:0; }
.badge-career { font-size:0.64rem; font-weight:500; padding:2px 8px; border-radius:20px; background:#f1f5f9; color:#64748b; }
.card-content { padding:1rem 1.1rem 0.6rem; flex:1; }
.card-meta-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:0.4rem; }
.card-date { font-size:0.7rem; color:#94a3b8; }
.card-career { font-size:0.67rem; color:#64748b; background:#f1f5f9; padding:2px 7px; border-radius:10px; font-weight:500; }
.card-title { font-family:'Syne',sans-serif; font-size:0.93rem; font-weight:800; color:#0f172a; line-height:1.35; margin-bottom:0.4rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.card-excerpt { font-size:0.77rem; color:#64748b; line-height:1.6; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.card-actions { display:flex; gap:0.4rem; padding:0.75rem 1.1rem; border-top:1px solid #f1f5f9; }
.action-btn { flex:1; padding:0.48rem 0.3rem; border-radius:7px; border:1px solid #e2e8f0; background:#fff; font-size:0.71rem; font-weight:500; cursor:pointer; text-decoration:none; text-align:center; transition:all 0.18s; color:#475569; font-family:'Inter',sans-serif; display:flex; align-items:center; justify-content:center; gap:0.3rem; }
.btn-edit:hover       { background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }
.btn-unpublish:hover  { background:#fff7ed; border-color:#fed7aa; color:#c2410c; }
.btn-publish-action:hover { background:#f0fdf4; border-color:#bbf7d0; color:#15803d; }
.btn-delete:hover     { background:#fff1f2; border-color:#fecdd3; color:#be123c; }
.action-btn:disabled  { opacity:0.45; cursor:not-allowed; }

/* ══════════ LIST ══════════ */
.news-list { display:flex; flex-direction:column; gap:0.65rem; }
.list-row { display:flex; align-items:center; gap:1rem; background:#fff; border-radius:12px; border:1px solid #e2e8f0; padding:0.9rem 1rem; transition:box-shadow 0.18s; }
.list-row:hover { box-shadow:0 4px 16px rgba(0,0,0,0.07); }
.list-row.is-draft { border-color:#fde68a; background:#fffef7; }
.list-img { width:78px; height:58px; border-radius:8px; overflow:hidden; flex-shrink:0; background:#f1f5f9; }
.list-img img { width:100%; height:100%; object-fit:cover; display:block; }
.list-img-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
.list-content { flex:1; min-width:0; }
.list-badges { display:flex; gap:0.35rem; margin-bottom:0.25rem; flex-wrap:wrap; }
.list-title { font-family:'Syne',sans-serif; font-size:0.87rem; font-weight:800; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:0.18rem; }
.list-excerpt { font-size:0.75rem; color:#64748b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:0.22rem; }
.list-meta { font-size:0.7rem; color:#94a3b8; }
.list-actions { display:flex; gap:0.4rem; flex-shrink:0; }
.icon-btn { width:32px; height:32px; border:1px solid #e2e8f0; border-radius:7px; background:#fff; cursor:pointer; color:#64748b; display:flex; align-items:center; justify-content:center; transition:all 0.18s; }
.icon-btn:hover       { background:#eff6ff; border-color:#bfdbfe; color:#1d4ed8; }
.ico-unpublish:hover  { background:#fff7ed; border-color:#fed7aa; color:#c2410c; }
.ico-publish:hover    { background:#f0fdf4; border-color:#bbf7d0; color:#15803d; }
.ico-delete:hover     { background:#fff1f2; border-color:#fecdd3; color:#be123c; }
.icon-btn:disabled    { opacity:0.45; cursor:not-allowed; }

/* Helpers */
.loading-row { display:flex; align-items:center; gap:0.4rem; }
.spinner-xs { display:inline-block; width:11px; height:11px; border:2px solid rgba(0,0,0,0.12); border-top-color:currentColor; border-radius:50%; animation:spin 0.5s linear infinite; flex-shrink:0; }

@media (max-width:720px) {
  .page-header { flex-direction:column; gap:1rem; align-items:flex-start; }
  .btn-new { width:100%; justify-content:center; }
  .stats-row { flex-wrap:wrap; }
  .filters-bar { flex-direction:column; align-items:stretch; }
  .news-grid { grid-template-columns:1fr; }
  .feed-list { grid-template-columns: 1fr; }
}
</style>