"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

interface FilterSidebarProps {
  priceRange: number[]
  setPriceRange: (range: number[]) => void
  selectedBrands: string[]
  setSelectedBrands: (brands: string[]) => void
  selectedProcessors: string[]
  setSelectedProcessors: (processors: string[]) => void
  selectedCategories: string[]
  setSelectedCategories: (categories: string[]) => void
  selectedRam: string[]
  setSelectedRam: (ram: string[]) => void
  selectedStorage: string[]
  setSelectedStorage: (storage: string[]) => void
  selectedScreen: string[]
  setSelectedScreen: (screen: string[]) => void
  inStockOnly: boolean
  setInStockOnly: (inStock: boolean) => void
  freeShippingOnly: boolean
  setFreeShippingOnly: (freeShipping: boolean) => void
  clearAllFilters: () => void
}

export function FilterSidebar({
  priceRange,
  setPriceRange,
  selectedBrands,
  setSelectedBrands,
  selectedProcessors,
  setSelectedProcessors,
  selectedCategories,
  setSelectedCategories,
  selectedRam,
  setSelectedRam,
  selectedStorage,
  setSelectedStorage,
  selectedScreen,
  setSelectedScreen,
  inStockOnly,
  setInStockOnly,
  freeShippingOnly,
  setFreeShippingOnly,
  clearAllFilters,
}: FilterSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-orange-500">
          Clear All
        </Button>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h4 className="font-medium">Price Range</h4>
        <div className="px-2">
          <Slider value={priceRange} onValueChange={setPriceRange} max={6000} min={0} step={50} className="mb-3" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Brand */}
      <div className="space-y-3">
        <h4 className="font-medium">Brand</h4>
        <div className="space-y-2">
          {["ASUS", "Dell", "HP", "Lenovo", "Apple"].map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBrands([...selectedBrands, brand])
                  } else {
                    setSelectedBrands(selectedBrands.filter((b) => b !== brand))
                  }
                }}
              />
              <label htmlFor={brand} className="text-sm cursor-pointer">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Processor */}
      <div className="space-y-3">
        <h4 className="font-medium">Processor</h4>
        <div className="space-y-2">
          {["Intel i3", "Intel i5", "Intel i7", "Intel i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9"].map(
            (processor) => (
              <div key={processor} className="flex items-center space-x-2">
                <Checkbox
                  id={processor}
                  checked={selectedProcessors.includes(processor)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedProcessors([...selectedProcessors, processor])
                    } else {
                      setSelectedProcessors(selectedProcessors.filter((p) => p !== processor))
                    }
                  }}
                />
                <label htmlFor={processor} className="text-sm cursor-pointer">
                  {processor}
                </label>
              </div>
            ),
          )}
        </div>
      </div>

      <Separator />

      {/* Category */}
      <div className="space-y-3">
        <h4 className="font-medium">Category</h4>
        <div className="space-y-2">
          {["Gaming", "Business", "Ultrabook", "Professional", "2-in-1", "Budget"].map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category])
                  } else {
                    setSelectedCategories(selectedCategories.filter((c) => c !== category))
                  }
                }}
              />
              <label htmlFor={category} className="text-sm cursor-pointer">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* RAM */}
      <div className="space-y-3">
        <h4 className="font-medium">RAM</h4>
        <div className="space-y-2">
          {["4GB", "8GB", "16GB", "32GB"].map((ram) => (
            <div key={ram} className="flex items-center space-x-2">
              <Checkbox
                id={ram}
                checked={selectedRam.includes(ram)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedRam([...selectedRam, ram])
                  } else {
                    setSelectedRam(selectedRam.filter((r) => r !== ram))
                  }
                }}
              />
              <label htmlFor={ram} className="text-sm cursor-pointer">
                {ram}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Storage */}
      <div className="space-y-3">
        <h4 className="font-medium">Storage</h4>
        <div className="space-y-2">
          {["128GB", "256GB", "512GB", "1TB", "2TB"].map((storage) => (
            <div key={storage} className="flex items-center space-x-2">
              <Checkbox
                id={storage}
                checked={selectedStorage.includes(storage)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedStorage([...selectedStorage, storage])
                  } else {
                    setSelectedStorage(selectedStorage.filter((s) => s !== storage))
                  }
                }}
              />
              <label htmlFor={storage} className="text-sm cursor-pointer">
                {storage}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Screen Size */}
      <div className="space-y-3">
        <h4 className="font-medium">Screen Size</h4>
        <div className="space-y-2">
          {["13 inch", "14 inch", "15 inch", "16 inch", "17 inch"].map((screen) => (
            <div key={screen} className="flex items-center space-x-2">
              <Checkbox
                id={screen}
                checked={selectedScreen.includes(screen)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedScreen([...selectedScreen, screen])
                  } else {
                    setSelectedScreen(selectedScreen.filter((s) => s !== screen))
                  }
                }}
              />
              <label htmlFor={screen} className="text-sm cursor-pointer">
                {screen}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Additional Filters */}
      <div className="space-y-3">
        <h4 className="font-medium">Additional Options</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="inStock" checked={inStockOnly} onCheckedChange={setInStockOnly} />
            <label htmlFor="inStock" className="text-sm cursor-pointer">
              In Stock Only
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="freeShipping" checked={freeShippingOnly} onCheckedChange={setFreeShippingOnly} />
            <label htmlFor="freeShipping" className="text-sm cursor-pointer">
              Free Shipping
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
