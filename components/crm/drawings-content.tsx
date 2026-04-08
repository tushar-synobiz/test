'use client'

import * as React from 'react'
import {
  Plus,
  Search,
  Upload,
  Download,
  Eye,
  MoreHorizontal,
  FileText,
  History,
  Shield,
  Droplets,
  User,
  Calendar,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import {
  drawings,
  currentUser,
  formatDate,
  formatDateTime,
  type Drawing,
} from '@/lib/crm-data'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(fileType: string) {
  if (fileType.includes('pdf')) return 'PDF'
  if (fileType.includes('figma')) return 'FIG'
  if (fileType.includes('acad') || fileType.includes('dwg')) return 'DWG'
  return 'FILE'
}

export function DrawingsContent() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [localDrawings, setLocalDrawings] = React.useState(drawings)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [selectedDrawing, setSelectedDrawing] = React.useState<Drawing | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const [newDrawing, setNewDrawing] = React.useState({
    title: '',
    description: '',
    isSecured: false,
    isWatermarked: true,
  })
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null)

  const filteredDrawings = localDrawings.filter(
    (drawing) =>
      drawing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drawing.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setUploadedFile(files[0])
    }
  }

  const handleCreate = () => {
    if (!uploadedFile || !newDrawing.title) return

    const newDrawingData: Drawing = {
      id: `draw-${Date.now()}`,
      title: newDrawing.title,
      description: newDrawing.description || undefined,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size,
      fileType: uploadedFile.type,
      version: 1,
      versions: [
        {
          version: 1,
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          uploadedBy: currentUser,
          uploadedAt: new Date(),
        },
      ],
      uploadedBy: currentUser,
      isSecured: newDrawing.isSecured,
      isWatermarked: newDrawing.isWatermarked,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setLocalDrawings((prev) => [newDrawingData, ...prev])
    setIsCreateDialogOpen(false)
    setNewDrawing({ title: '', description: '', isSecured: false, isWatermarked: true })
    setUploadedFile(null)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Drawings</h1>
          <p className="text-sm text-muted-foreground">
            Manage technical drawings, diagrams, and design files
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 size-4" />
          Upload Drawing
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drawings</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{localDrawings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Secured</CardTitle>
            <Shield className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {localDrawings.filter((d) => d.isSecured).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watermarked</CardTitle>
            <Droplets className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {localDrawings.filter((d) => d.isWatermarked).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search drawings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrawings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <p className="text-muted-foreground">No drawings found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDrawings.map((drawing) => (
                  <TableRow key={drawing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-secondary font-mono text-xs font-bold">
                          {getFileIcon(drawing.fileType)}
                        </div>
                        <div>
                          <p className="font-medium">{drawing.title}</p>
                          <p className="text-xs text-muted-foreground">{drawing.fileName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">v{drawing.version}</Badge>
                    </TableCell>
                    <TableCell>{drawing.uploadedBy.name}</TableCell>
                    <TableCell>{formatDate(drawing.updatedAt)}</TableCell>
                    <TableCell>{formatFileSize(drawing.fileSize)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {drawing.isSecured && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="size-3" />
                            Secured
                          </Badge>
                        )}
                        {drawing.isWatermarked && (
                          <Badge variant="secondary" className="gap-1">
                            <Droplets className="size-3" />
                            Watermarked
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedDrawing(drawing)}>
                            <History className="mr-2 size-4" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 size-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 size-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Upload className="mr-2 size-4" />
                            Upload New Version
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Drawing</DialogTitle>
            <DialogDescription>
              Upload a new technical drawing or design file
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
                isDragging ? 'border-primary bg-primary/5' : 'border-border',
                uploadedFile && 'border-primary bg-primary/5'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadedFile ? (
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-secondary font-mono text-xs font-bold">
                    {getFileIcon(uploadedFile.type)}
                  </div>
                  <div>
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => setUploadedFile(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="mb-2 size-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or{' '}
                    <label className="cursor-pointer text-primary hover:underline">
                      browse
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".pdf,.dwg,.dxf,.fig,.png,.jpg,.jpeg"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, DWG, DXF, Figma, PNG, JPG
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newDrawing.title}
                onChange={(e) =>
                  setNewDrawing((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter drawing title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newDrawing.description}
                onChange={(e) =>
                  setNewDrawing((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional description"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Shield className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Secured</p>
                  <p className="text-xs text-muted-foreground">Restrict access</p>
                </div>
              </div>
              <Switch
                checked={newDrawing.isSecured}
                onCheckedChange={(checked) =>
                  setNewDrawing((prev) => ({ ...prev, isSecured: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Droplets className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Watermarked</p>
                  <p className="text-xs text-muted-foreground">Add watermark on download</p>
                </div>
              </div>
              <Switch
                checked={newDrawing.isWatermarked}
                onCheckedChange={(checked) =>
                  setNewDrawing((prev) => ({ ...prev, isWatermarked: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!uploadedFile || !newDrawing.title}>
              <Upload className="mr-2 size-4" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!selectedDrawing} onOpenChange={() => setSelectedDrawing(null)}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="size-5" />
              Version History
            </SheetTitle>
            <SheetDescription>{selectedDrawing?.title}</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedDrawing?.versions.map((version, index) => (
              <div
                key={version.version}
                className={cn(
                  'flex items-start gap-4 rounded-lg border p-4',
                  index === 0 && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                  v{version.version}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{version.fileName}</p>
                    {index === 0 && <Badge>Current</Badge>}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="size-3" />
                      {version.uploadedBy.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatDateTime(version.uploadedAt)}
                    </span>
                    <span>{formatFileSize(version.fileSize)}</span>
                  </div>
                  {version.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">{version.notes}</p>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="size-8">
                  <Download className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
