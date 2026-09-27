import { Badge, CloseButton, Form } from 'react-bootstrap'

type Props = {
  search: string
  onSearch: (value: string) => void
  tag: string | null
  onClearTag: () => void
}

function SearchBar({ search, onSearch, tag, onClearTag }: Props) {
  return (
    <div className="d-flex align-items-center gap-2 mb-3">
      <Form.Control
        type="search"
        placeholder="Search titles, users, or tags"
        aria-label="Search images"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      {tag && (
        <Badge bg="secondary" className="d-flex align-items-center gap-1 fs-6">
          #{tag}
          <CloseButton variant="white" aria-label={`Remove #${tag} filter`} onClick={onClearTag} />
        </Badge>
      )}
    </div>
  )
}

export default SearchBar