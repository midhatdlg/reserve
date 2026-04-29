import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoGallery } from './PhotoGallery';
import type { Photo } from '@/types';

function makePhotos(n: number): Photo[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `p${i + 1}`,
    wedding_id: 'w',
    image_url: `https://cdn/${i + 1}.jpg`,
    caption: i === 0 ? 'Our first dance' : null,
    sort_order: i,
    created_at: new Date().toISOString(),
  }));
}

describe('<PhotoGallery />', () => {
  it('renders nothing when there are no photos', () => {
    const { container } = render(<PhotoGallery photos={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a grid of thumbnails with accessible alt text', () => {
    render(<PhotoGallery photos={makePhotos(3)} />);
    expect(screen.getByAltText('Our first dance')).toBeInTheDocument();
    expect(screen.getByAltText('Photo 2')).toBeInTheDocument();
    expect(screen.getByAltText('Photo 3')).toBeInTheDocument();
  });

  it('opens the lightbox when a thumbnail is clicked and closes with ×', async () => {
    render(<PhotoGallery photos={makePhotos(2)} />);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button')[0]);

    // Lightbox shows counter "1 / 2"
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    await user.click(screen.getByText('×'));
    expect(screen.queryByText('1 / 2')).toBeNull();
  });

  it('cycles backwards via the previous arrow (wrapping)', async () => {
    render(<PhotoGallery photos={makePhotos(3)} />);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    await user.click(screen.getByText('‹'));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    await user.click(screen.getByText('‹'));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('closes when the backdrop is clicked but stays open when the photo itself is clicked', async () => {
    render(<PhotoGallery photos={makePhotos(2)} />);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button')[0]);
    // Both the thumbnail and lightbox img share the same alt text — grab the
    // larger (lightbox) one by selecting the last match.
    const imgs = screen.getAllByAltText('Our first dance');
    const lightboxImg = imgs[imgs.length - 1];
    await user.click(lightboxImg);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    const backdrop = screen.getByText('1 / 2').parentElement as HTMLElement;
    await user.click(backdrop);
    expect(screen.queryByText('1 / 2')).toBeNull();
  });

  it('does not render nav arrows when there is only one photo', async () => {
    render(<PhotoGallery photos={makePhotos(1)} />);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button')[0]);
    expect(screen.queryByText('‹')).toBeNull();
    expect(screen.queryByText('›')).toBeNull();
  });

  it('cycles through photos via the next arrow', async () => {
    render(<PhotoGallery photos={makePhotos(3)} />);
    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button')[0]);
    expect(screen.getByText('1 / 3')).toBeInTheDocument();

    await user.click(screen.getByText('›'));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
    await user.click(screen.getByText('›'));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    // wraps around
    await user.click(screen.getByText('›'));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });
});
